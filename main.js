/**@type {HTMLCanvasElement} */

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

canvas.width = 800
canvas.height = 600

function spawnBrick(){
    const patterns = [
        [0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
    ]

    const bricks = []

    patterns.forEach((row, rowIndex) => {
        row.forEach((coloumn, coloumnIndex) => {
            switch(coloumn){
                case 1:
                    const position = {
                        x: 80 + 60 * coloumnIndex,
                        y: 50 + 15 * rowIndex
                    }
                    bricks.push(new Brick(position))
                    break
                default:
                    break
            }
        })
    })

    return bricks;
}

function ballCollideWithPaddle(ball, paddle){
    return ball.position.y + ball.radius >= paddle.position.y &&
        ball.position.y <= paddle.position.y + paddle.height &&
        ball.position.x + ball.radius <= paddle.position.x + paddle.width &&
        ball.position.x >= paddle.position.x
}

function ballCollideWithBrick(ball, brick){
    return ball.position.y + ball.radius >= brick.position.y &&
        ball.position.y <= brick.position.y + brick.height &&
        ball.position.x + ball.radius <= brick.position.x + brick.width &&
        ball.position.x >= brick.position.x
}

class Brick{
    constructor(position){
        this.image = new Image()
        this.image.src = './assets/images/brick.png'
        this.width = 60
        this.height = 15
        this.position = position
    }

    draw(ctx){
        // ctx.fillStyle = 'brown'
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
        ctx.drawImage(this.image, this.position.x, this.position.y, this.width, this.height)
    }

    update(){

    }
}

class Ball{
    constructor(){
        this.position = {
            x: 50,
            y: (canvas.height / 2) + 50
        }

        this.speed = {
            x: 3,
            y: -5
        }

        this.radius = 15
    }

    draw(ctx){
        ctx.beginPath()
        ctx.fillStyle = 'red'
        ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.closePath()
    }

    update(){
        if(this.radius + this.position.x > canvas.width){
            this.speed.x = -this.speed.x
        }

        if(this.position.x < 0){
            this.speed.x = -this.speed.x
        }

        if(this.position.y - this.radius / 2 < 0){
            this.speed.y = -this.speed.y
        }

        this.position.x += this.speed.x
        this.position.y += this.speed.y
    }
}

class Paddle{
    constructor(){
        this.width = 120
        this.height = 20
        this.position = {
            x: canvas.width / 2 - this.width / 2,
            y: canvas.height - 20 - 10
        }
        this.speed = 0
        this.maxSpeed = 8
    }

    moveLeft(){
        this.speed = -this.maxSpeed
    }

    moveRight(){
        this.speed = this.maxSpeed
    }

    stop(){
        this.speed = 0
    }

    draw(ctx){
        ctx.fillStyle = 'indigo'
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    update(){
        if(this.width + this.position.x > canvas.width){
            this.position.x = canvas.width - this.width
        }

        if(this.position.x < 0){
            this.position.x = 0
        }

        this.position.x += this.speed
    }
}

class EventHandler{
    constructor(game){
        document.addEventListener('keydown', e => {
            switch(e.key){
                case 'ArrowLeft':
                    game.paddle.moveLeft()
                    break
                case 'ArrowRight':
                    game.paddle.moveRight()
                    break
                default:
                    break
            }
        })

        document.addEventListener('keyup', e => {
            switch(e.key){
                case 'ArrowLeft':
                    if(game.paddle.speed < 0){
                        game.paddle.stop()
                    }
                    break
                case 'ArrowRight':
                    if(game.paddle.speed > 0){
                        game.paddle.stop()
                    }
                    break
                default:
                    break
            }
        })
    }
}

class Game{
    constructor(){
        this.lives = 3
        this.score = 0
        this.bricks = spawnBrick()
        this.reset()
    }

    reset(){
        this.paddle = new Paddle()
        this.ball = new Ball()
        new EventHandler(this)
    }

    drawConfig(ctx){
        ctx.font = '15px Arial'
        ctx.fillStyle = 'black'
        ctx.fillText('Name: ' + localStorage.getItem('name'), 10, 20)
        ctx.fillText('Score: ' + this.score, 10, 35)
        ctx.fillText('Lives: ' + this.lives, 10, 50)
    }

    draw(ctx){
        [...this.bricks, this.paddle, this.ball].forEach(object => object.draw(ctx))

        this.drawConfig(ctx)
    }
    
    update(){
        [...this.bricks, this.paddle, this.ball].forEach(object => object.update())

        this.bricks.forEach((brick, index) => {
            if(ballCollideWithBrick(this.ball, brick)){
                const sound = new Audio()
                sound.src = './assets/sounds/pumpkin_break_01.ogg'
                sound.play()
                this.ball.speed.y *= -1
                this.score += 10
                this.bricks.splice(index, 1)
            }
        })

        if(ballCollideWithPaddle(this.ball, this.paddle)){
            this.ball.speed.y *= -1;
            this.ball.position.y = this.paddle.position.y - this.ball.radius;
        }

        if(this.ball.position.y + this.ball.radius > canvas.height){
            this.lives--
            this.reset()
        }

        if(this.lives < 0){
            gameover = true
        }

    }
}

const game = new Game()

let gameover = false
localStorage.clear()

function animate(){
    if(!gameover){
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        game.draw(ctx)
        game.update()
        requestAnimationFrame(animate)
    }else{
        drawGameOver()
    }
}

function play(){
    if(localStorage.getItem('name')){
        document.querySelector('.menu').style.display = 'none'
        document.querySelector('.game').style.display = 'flex'
        animate()
    }
}

function drawGameOver(){
    // document.querySelector('.game').style.display = 'none'
    document.querySelector('.gameover').style.display = 'flex'
}

const input_name = document.getElementById('input_name')
input_name.addEventListener('change', () => {
    localStorage.setItem('name', input_name.value)
})

document.getElementById('submit').addEventListener('click', play)