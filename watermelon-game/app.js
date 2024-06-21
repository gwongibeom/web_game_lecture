import { FRUITS } from './fruits.js'
import { checkX } from './util/checkX.js'
import { extractNumbers } from './util/extractNumbers.js'
const Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  World = Matter.World

// 엔진 선언
const engine = Engine.create()

// 렌더 선언
const render = Render.create({
  engine,
  element: document.body,
  options: {
    wireframes: false, // True면 색 적용 안됨
    background: '#F7F4C8', // 배경
    width: 620,
    height: 850,
  },
})

// 월드 생성
const world = engine.world

const objects = {
  //플랫폼

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
  overLine: Bodies.rectangle(310, 150, 620, 2, {
    isStatic: true,
    collisionFilter: false,
    render: { fillStyle: '#ff2400' },
  }),

  // //오브젝트

  // circle: Bodies.circle(300, 130, 12, { isSleeping: true }),
}

// 벽 배치
World.add(world, Object.values(objects))

Render.run(render)
Runner.run(engine)

const canvas = document.querySelector('canvas')
let index = 0
let TempUserMouseLocationCircle = null

canvas.addEventListener('mousemove', (e) => onMouseMove(e))
const onMouseMove = (e) => {
  if (TempUserMouseLocationCircle != null) {
    Matter.Composite.remove(world, TempUserMouseLocationCircle)
  }
  const x = checkX(e.pageX)

  const fruit = FRUITS[index]

  const userMouseLocationCircle = Bodies.circle(x, 100, fruit.radius, {
    collisionFilter: false,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0.2,
  })

  TempUserMouseLocationCircle = userMouseLocationCircle

  World.add(world, userMouseLocationCircle)
}

canvas.addEventListener('click', (e) => addFruit(e))
const addFruit = (e) => {
  if (TempUserMouseLocationCircle != null) {
    Matter.Composite.remove(world, TempUserMouseLocationCircle)
  }
  // 과일 INDEX 저장
  const fruit = FRUITS[index]

  let x = checkX(e.pageX)

  const body = Bodies.circle(x, 100, fruit.radius, {
    render: {
      sprite: { texture: `${fruit.name}.png` },
    },
    restitution: 0,
  })

  World.add(world, body)
  index = Math.floor(Math.random() * 5)
}

Matter.Events.on(engine, 'collisionStart', (e) => {
  e.pairs.map((collisionEvent) => {
    const bodyATexture = collisionEvent.bodyA.render.sprite.texture
    const bodyBTexture = collisionEvent.bodyB.render.sprite.texture

    if (bodyATexture != bodyBTexture) return

    console.log(collisionEvent)

    const bodyAPosition = collisionEvent.bodyA.position
    const bodyASpriteNum = extractNumbers(bodyATexture)
    const bodyBSpriteNum = extractNumbers(bodyBTexture)

    if (bodyASpriteNum === bodyBSpriteNum) {
      Matter.Composite.remove(world, collisionEvent.bodyA)
      Matter.Composite.remove(world, collisionEvent.bodyB)

      const BIGGERFRUITS = FRUITS[Number(bodyASpriteNum) + 1]
      console.log(bodyAPosition)

      const BiggerCircle = Bodies.circle(
        bodyAPosition.x,
        bodyAPosition.y,
        BIGGERFRUITS.radius,
        {
          render: {
            sprite: { texture: `${BIGGERFRUITS.name}.png` },
          },
          restitution: 0.1,
        }
      )
      World.add(world, BiggerCircle)
    }
  })
})
