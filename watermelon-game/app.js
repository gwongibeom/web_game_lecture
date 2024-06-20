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
    render: { fillStyle: '#ff2400' },
  }),
  circle: Bodies.circle(300, 200, 12, { isSleeping: true }),
}

// 벽 배치
World.add(world, Object.values(objects))

Render.run(render)
Runner.run(engine)
