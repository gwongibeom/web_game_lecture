import { FRUITS } from './fruits.js'
import { checkX } from './util/checkX.js'
import { extractNumbers } from './util/extractNumbers.js'
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  World = Matter.World,
  Events = Matter.Events

// 엔진 선언
const engine = Engine.create()

// 렌더 선언
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false,
    background: '#F7F4C8',
    width: 620,
    height: 850,
  },
})

// 월드 생성
const world = engine.world

const OVERLINE_Y = 150 // 오버라인의 Y 좌표
const SPAWN_Y = 80 // 과일 생성 위치의 Y 좌표 (오버라인보다 위)

const objects = {
  leftWall: Bodies.rectangle(15, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E6B143' },
  }),
  rightWall: Bodies.rectangle(605, 395, 30, 790, {
    isStatic: true,
    render: { fillStyle: '#E6B143' },
  }),
  ground: Bodies.rectangle(310, 820, 620, 60, {
    isStatic: true,
    render: { fillStyle: '#E6B143' },
  }),
  overLine: Bodies.rectangle(310, OVERLINE_Y, 620, 2, {
    isStatic: true,
    isSensor: true,
    render: { fillStyle: '#ff2400' },
  }),
}

// 벽 배치
World.add(world, Object.values(objects))

Render.run(render)
Runner.run(engine)

const canvas = document.querySelector('canvas')
let index = 0
let TempUserMouseLocationCircle = null
let isGameOver = false
let lastSpawnTime = 0
const SPAWN_DELAY = 10 // 연속 생성 방지를 위한 딜레이 (밀리초)
let lastAddedFruit = null
const GAME_OVER_DELAY = 2000 // 과일 생성 후 게임오버 체크까지의 지연 시간 (밀리초)

canvas.addEventListener('mousemove', (e) => onMouseMove(e))
const onMouseMove = (e) => {
  if (isGameOver) return

  if (TempUserMouseLocationCircle != null) {
    Matter.Composite.remove(world, TempUserMouseLocationCircle)
  }
  const x = checkX(e.pageX)

  const fruit = FRUITS[index]

  const userMouseLocationCircle = Bodies.circle(x, SPAWN_Y, fruit.radius, {
    collisionFilter: { group: -1 },
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0.2,
    label: 'tempFruit',
    isSensor: true, // 충돌제거
  })

  TempUserMouseLocationCircle = userMouseLocationCircle

  World.add(world, userMouseLocationCircle)
}

canvas.addEventListener('click', (e) => addFruit(e))
const addFruit = (e) => {
  if (isGameOver) return

  const currentTime = Date.now()
  if (currentTime - lastSpawnTime < SPAWN_DELAY) return
  lastSpawnTime = currentTime

  const fruit = FRUITS[index]

  let x = checkX(e.pageX)

  const body = Bodies.circle(x, SPAWN_Y, fruit.radius, {
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0,
    label: 'fruit',
  })

  lastAddedFruit = body
  World.add(world, body)
  index = Math.floor(Math.random() * 5)

  console.log(`과일 생성: x=${x}, y=${SPAWN_Y}, radius=${fruit.radius}`)
}

Events.on(engine, 'collisionStart', (e) => {
  e.pairs.map((collisionEvent) => {
    const bodyATexture = collisionEvent.bodyA.render.sprite.texture
    const bodyBTexture = collisionEvent.bodyB.render.sprite.texture

    if (bodyATexture != bodyBTexture) return

    const bodyAPosition = collisionEvent.bodyA.position
    const bodyASpriteNum = extractNumbers(bodyATexture)
    const bodyBSpriteNum = extractNumbers(bodyBTexture)

    if (Number(bodyASpriteNum) + 1 > 10) return

    if (bodyASpriteNum === bodyBSpriteNum) {
      Matter.Composite.remove(world, collisionEvent.bodyA)
      Matter.Composite.remove(world, collisionEvent.bodyB)

      const BIGGERFRUITS = FRUITS[Number(bodyASpriteNum) + 1]

      const BiggerCircle = Bodies.circle(
        bodyAPosition.x,
        bodyAPosition.y,
        BIGGERFRUITS.radius,
        {
          render: {
            sprite: { texture: `${BIGGERFRUITS.name}.png` },
          },
          restitution: 0.1,
          label: 'fruit',
        }
      )
      World.add(world, BiggerCircle)
    }
  })
})

// 게임오버 체크 함수
const checkGameOver = () => {
  if (!lastAddedFruit) return false

  const currentTime = Date.now()
  if (currentTime - lastSpawnTime < GAME_OVER_DELAY) return false

  const bodies = Matter.Composite.allBodies(world)
  for (let body of bodies) {
    if (
      body.label === 'fruit' &&
      body.position.y < OVERLINE_Y &&
      body.velocity.y >= 0
    ) {
      console.log(
        `게임오버 조건 만족: x=${body.position.x}, y=${body.position.y}, vy=${body.velocity.y}`
      )
      return true
    }
  }
  return false
}

// 게임오버 처리 함수
const handleGameOver = () => {
  isGameOver = true
  console.log('게임 오버!')

  // 게임오버 메시지 표시
  const gameOverMessage = document.createElement('div')
  gameOverMessage.textContent = '게임 오버!'
  gameOverMessage.style.position = 'absolute'
  gameOverMessage.style.top = '50%'
  gameOverMessage.style.left = '50%'
  gameOverMessage.style.transform = 'translate(-50%, -50%)'
  gameOverMessage.style.fontSize = '48px'
  gameOverMessage.style.color = 'red'
  document.body.appendChild(gameOverMessage)

  // 재시작 버튼 추가
  const restartButton = document.createElement('button')
  restartButton.textContent = '재시작'
  restartButton.style.position = 'absolute'
  restartButton.style.top = '60%'
  restartButton.style.left = '50%'
  restartButton.style.transform = 'translate(-50%, -50%)'
  restartButton.style.fontSize = '24px'
  restartButton.addEventListener('click', restartGame)
  document.body.appendChild(restartButton)
}

// 게임 재시작 함수
const restartGame = () => {
  location.reload()
}

// 게임 루프에 게임오버 체크 추가
Events.on(engine, 'afterUpdate', () => {
  if (!isGameOver && checkGameOver()) {
    handleGameOver()
  }
})

// 디버그 정보 표시
setInterval(() => {
  if (lastAddedFruit) {
    console.log(
      `마지막 추가된 과일 위치: x=${lastAddedFruit.position.x}, y=${lastAddedFruit.position.y}`
    )
  }
}, 1000)
