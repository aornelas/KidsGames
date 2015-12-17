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
arrows = []
foundPlanets = []
score = 0
results = text("")
planet = stamp('pluto5',-100,400,200)
pod = stamp('saucer',saucerX,saucerY)
scoreboard = text(score,700,990,80,'white')

repeat(createAstro,astroCount)
delay(showArrows,driftOutSecs*1000)
pod.back()
updateScore()
createSun()
delay(startPlanets,3000)

// Workaround for delay function leak
sessionKey = random(9999999)

function startPlanets() {
    launchPlanet(sessionKey)
}

function launchPlanet(key) {
  // Only launch planet if this is the latest session
  // TODO: Add start/reset button to avoid bitsbox rerun
  currentSession = key == sessionKey
  if (!launched && currentSession) {
    planetIndex = random(10) - 1
    planetStamp = planetStamps[planetIndex]
    planetY = random(900)
    planet = stamp(planetStamp,-100,planetY,165+random(65))
    planet.rotate((random(100)+50)*360,rotationSecs*1000)
    planet.move(1000,planetY,5000)
    delay(function() { launchPlanet(key) },(planetBeatSecs+random(3)-1)*1000)
  }
}

function createSun() {
  sun = stamp('sun',30)
  sun.back()
}

function createArrow() {
  arrow = stamp('arrow3',205)
  arrow.hide()
  arrow.move()
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
  sound('explosion')
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
    sound('nuke',60)
  }
  if (astronaut.hits(pod)) {
    score++
    updateScore()
    astronaut.rotate(0).change('astro')
    sound('jump',30)
    if (launched) {
      sound('whoohoo')
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

function loop() {
  find('flyer').forEach(fly)
  saved = find('astro')
  drifting = find('drifter')
  if (drifting.length == 0) {
    pod.change('flying saucer')
    launch(pod)
    saved.forEach(launch)
    if (!launched) {
      printResults()
      sound('rocket',50)
      launched = true
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

