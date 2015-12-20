/*
 * astronauts
 * by @andres
 * http://bit.ly/bb-astro
 *
 * based on bitsbox activity "Escape Pod" (2902)
 */

fill('stars2')

saucerX = 350
saucerY = 900
astroCount = 5
astroSpeed = 20
rotationRevs = 100
rotationSecs = 500
driftOutSecs = 1
launchSecs = 3
planetBeatSecs = 4
resultDelaySecs = 1.5
sunSize = 30
sunGrowth = 0.012

planetStamps = [
  'mercury',
  'venus',
  'earth',
  'moon',
  'mars',
  'jupiter',
  'saturn',
  'neptune',
  'uranus',
  'pluto6'
]

launched = false
burned = false
arrows = []
foundPlanets = []
score = 0
results = text('')
sun = stamp('sun2',sunSize)
planet = stamp('pluto5',-100,400,200)
pod = stamp('saucer',saucerX,saucerY)
scoreboard = text(score,700,990,80,'white')
planetKey = random(9999999)
sunKey = random(9999999)
logOffset = 50

repeat(createAstro,astroCount)
delay(showArrows,driftOutSecs*1000)
pod.back()
updateScore()
sun.back()
startSun()
startPlanets()

// Thermometer values
heatingKey = random(9999999)
coolingKey = random(9999999)
lineWidth = 4
circleMax = 25
circleRadius = 1
circleRadiusCooling = 1
circleX = 60
circleY = 980
boxMax = 220
boxHeight = 10
boxHeightCooling = 1
boxX = 50
boxY = 780
boxWidth = 16

// Draw thermometer
line(lineWidth)
box(boxX,boxY,boxWidth+lineWidth,boxMax+lineWidth,'light gray','light gray')
circle(circleX,circleY,circleMax+lineWidth-1,'light gray','light gray')
fire = stamp('dragon fire',60,735,100)

startHeating()

function startHeating() {
  heatUp(heatingKey)
}

function heatUp(key) {
  if (key != heatingKey) {
    return
  }
  if (circleRadius < circleMax) {
    circle(circleX,circleY,circleRadius,'red')
    circleRadius += 0.5
    delay(function() { heatUp(key) },50)
  } else if (boxHeight > (boxMax-circleMax-22)*-1) {
    box(boxX+lineWidth,circleY-circleMax,boxWidth-lineWidth,boxHeight,'red')
    boxHeight -= 0.5
    if (boxHeight == -100) {
      fire.dance()
      sound('warning')
    }
    if (boxHeight == -150) {
      fire.dance()
      sound('alert')
    }
    delay(function() { heatUp(key) },50)
  } else {
    burn()
  }
}

function startCooling() {
  heatingKey = -1
  circleRadiusCooling = circleRadius + 2
  coolDown(coolingKey)
}

function coolDown(key) {
  if (key != coolingKey) {
    return
  }
  if (boxHeightCooling < boxHeight * -1) {
    boxYCooling = circleY-circleMax+boxHeight
    box(boxX+lineWidth,boxYCooling,boxWidth-lineWidth,boxHeightCooling,'light gray')
    boxHeightCooling += 2.5
    delay(function() { coolDown(key) },50)
  } else if (circleRadiusCooling > 0) {
    line(1)
    circle(circleX,circleY,circleRadiusCooling,'clear','light gray')
    circleRadiusCooling -= 0.25
    delay(function() { coolDown(key) },15)
  }
}

function startPlanets() {
  launchPlanet(planetKey)
}

function launchPlanet(key) {
  if (!launched && key == planetKey) {
    planetIndex = random(10) - 1
    planetStamp = planetStamps[planetIndex]
    planetY = random(670)
    planet = stamp(planetStamp,-100,planetY,165+random(65))
    planet.rotate((random(100)+50)*360,rotationSecs*1000)
    planet.move(1000,planetY,5000)
    delay(function() { launchPlanet(key) },(planetBeatSecs+random(3)-1)*1000)
  }
}

function startSun() {
  growSun(sunKey)
}

function growSun(key) {
  if (sunSize < 30000 && key == sunKey) {
    sun.back()
    sunSize += sunSize*sunGrowth
    sun.size(sunSize)
    delay(function() { growSun(key) },40)
  }
}

function createArrow() {
  arrow = stamp('arrow3',-1000,-1000,205)
  arrow.hide()
  arrow.move(random(750),random(670))
  arrow.rotate()
  arrow.rotate(rotationRevs*360,rotationSecs*1000)
  arrows.push(arrow)
  return arrow
}

function createAstro() {
  astro = stamp('drifter',saucerX,saucerY,100)
  astro.arrow = createArrow()
  astro.move(arrow.x,arrow.y,driftOutSecs*1000)
  astro.rotate(arrow.rotation)
  astro.rotate(rotationRevs*360,rotationSecs*1000)
  astro.tap = thrust
}

function thrust() {
  this.change('flyer')
  this.rotate(this.rotation)
  sound('zap')
}

function launch(target) {
  target.move(target.x,-600,launchSecs*1000)
}

function fly(astronaut) {
  astronaut.tap = undefined
  astronaut.arrow.hide()
  astronaut.move(UP,astroSpeed)
  if (astronaut.hits(planet)) {
    astronaut.explode()
    sound('boom',60)
  }
  if (astronaut.hits(pod)) {
    score++
    updateScore()
    astronaut.rotate(0).change('astro')
    sound('whoohoo')
    if (launched) {
      printResults()
    }
  }
}

function updateScore() {
  scoreboard.change(score)
}

function printResults() {
  results.hide()
  scoreboard.hide()
  messageX = 160
  if (score == 0) {
    message = 'nadie alcanzó'
    messageX += 110
    delay(soundToilet,resultDelaySecs)
  } else if (score == 1) {
    message = '¡salvaste a 1 astronauta!'
    messageX += 40
  } else if (score > 1 && score < astroCount) {
    message = '¡salvaste a ' + score + ' astronautas!'
    messageX += 35
    delay(soundClaps,resultDelaySecs)
  } else {
    message = '¡salvaste a TODOS los astronautas!'
    messageX -= 80
    delay(soundApplause,resultDelaySecs)
  }
  results = text(message,messageX,990,'white')
}

function burn() {
  if (!launched) {
    sound('thunder2')
    arrows.forEach(explode)
    saved.forEach(explode)
    drifting.forEach(explode)
    flyers.forEach(explode)
    pod.explode()
    planet.explode()
    planetKey = -1
    burned = true
    printResults()
  }
}

function loop() {
  if (burned) {
    return
  }
  flyers = find('flyer')
  saved = find('astro')
  drifting = find('drifter')
  flyers.forEach(fly)
  if (drifting.length == 0) {
    pod.change('flying saucer')
    launch(pod)
    saved.forEach(launch)
    sunTarget = sunSize*3
    if (sunTarget < 2000) {
      sunTarget = 2000
    }
    sun.move(sun.x,sunTarget,launchSecs*1000)
    planet.move(planet.x,sunTarget,launchSecs*1000)
    sunKey = -1
    if (!launched) {
      printResults()
      sound('rocket',50)
      launched = true
      startCooling()
    }
  }
}

function showArrows() {
  arrows.forEach(showArrow)
}

function showArrow(arrow) {
  arrow.back()
  arrow.show()
}

function soundToilet() {
  sound('toilet')
}

function soundClaps() {
  sound('claps')
}

function soundApplause() {
  sound('applause')
}

function log(msg) {
  text(msg,50,logOffset,30,'white')
  logOffset += 50
}
