var socket = io()




function randomRange(high, low) {
    return Math.random() * (high - low) + low;
}


var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')
var chatText = document.getElementById('chat-text')
var chatInput = document.getElementById('chat-input')
var chatForm = document.getElementById('chat-form')
var px = 0
var py = 0
var clientId
ctx.font = '30px Arial'

var Sprites = {}
Sprites.fireball = new Image()
Sprites.fireball.src = '/client/images/bomb.png'
Sprites.cookieSprite = new Image();
Sprites.cookieSprite.src = "/client/images/cookie.png";

let drawMap = () => {
    // ctx.drawImage(Sprites.map, 0,0,800,600)
}

var drawScore = function () {
    ctx.fillStyle = 'white'
    ctx.fillText(Player.list[clientId].score, 10, 50)
    ctx.fillStyle = 'black'
}

var drawHP = function () {
    ctx.fillStyle = 'white'
    ctx.fillText(Player.list[clientId].hp, 750, 50)
    ctx.fillStyle = 'black'
}




var Player = function (initPack) {
    var self = {}
    self.id = initPack.id
    self.number = initPack.number
    self.x = initPack.x
    self.y = initPack.y
    self.hp = initPack.hp
    self.hpMax = initPack.hpMax
    self.score = initPack.score
    
    self.up = false
    self.left = false
    self.right = false
    self.flamelength = 30

    self.draw = function () {
     
        ctx.save();
        ctx.translate(self.x, self.y);
      
        if (self.up == true || self.left == true || self.right == true) {
            ctx.save();
           
            if (self.flamelength == 30) {
                self.flamelength = 10;
            }
            else {
                self.flamelength = 30;
            }
            ctx.beginPath();
            ctx.fillStyle = "orange";
            ctx.moveTo(0, this.flamelength);
            ctx.lineTo(5, 5);
            ctx.lineTo(-5, 5);
            ctx.lineTo(0, this.flamelength);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.lineTo(0, -10);
        ctx.closePath();
        ctx.fill();

        ctx.restore();

    }

    Player.list[self.id] = self
    return self

}

Player.list = {}

var Bullet = function (initPack) {
    var self = {}
    self.id = initPack.id
    self.x = initPack.x
    self.y = initPack.y

    self.draw = function () {
      
        ctx.drawImage(Sprites.fireball, self.x - 5, self.y - 5, 15, 10)


        
    }

    Bullet.list[self.id] = self
    return self

}

Bullet.list = {}

var Asteroids = function (initPack) {
    var self = {}
    self.id = initPack.id
    self.x = initPack.x
    self.y = initPack.y
    self.radius = initPack.radius
    
    self.color = "white";

    self.draw = function () {
      
        ctx.save();
   
        ctx.beginPath();
        ctx.fillStyle = self.color;
        ctx.arc(self.x, self.y, self.radius, 0, 2 * Math.PI, true);
        ctx.closePath();
        ctx.fill();
        ctx.drawImage(Sprites.cookieSprite,self.x - self.radius,self.y-self.radius,self.radius*2, self.radius*2)
        ctx.restore();
    }

    Asteroids.list[self.id] = self
    return self

}

Asteroids.list = {}




socket.on('connected', function (data) {
    clientId = data
    console.log(clientId)
})


socket.on('init', function (data) {
    for (var i = 0; i < data.player.length; i++) {
        new Player(data.player[i])
    }
    for (var i = 0; i < data.bullet.length; i++) {
        new Bullet(data.bullet[i])
    }

    for (var i = 0; i < data.asteroid.length; i++) {
        new Asteroids(data.asteroid[i])
    }

})


socket.on('update', function (data) {
  
    
    var score = Player.list[clientId].score;
    console.log(score);
    score = score + 1;
   
    for (var i = 0; i < data.player.length; i++) {
        if (clientId == data.player[i].id) {
            px = data.player[i].x
            py = data.player[i].y
        }
        
        var pack = data.player[i]
        var p = Player.list[pack.id]
        

        if (p) {
            if (pack.x !== undefined) {
                p.x = pack.x
            }
            if (pack.y !== undefined) {
                p.y = pack.y
            }
            if (pack.hp !== undefined) {
                p.hp = pack.hp
            }
            if (pack.hpMax !== undefined) {
                p.hpMax = pack.hpMax
            }
            if (pack.score !== undefined) {
                p.score = pack.score
            }

        }

    }
    for (var i = 0; i < data.bullet.length; i++) {
        var pack = data.bullet[i]
        var b = Bullet.list[pack.id]
        if (b) {
            if (pack.x !== undefined) {
                b.x = pack.x
            }
            if (pack.y !== undefined) {
                b.y = pack.y
            }
        }
    }

    for (var i = 0; i < data.asteroid.length; i++) {
        var pack = data.asteroid[i]
        var a = Asteroids.list[pack.id]
        if (a) {
            if (pack.x !== undefined) {
                a.x = pack.x
            }
            if (pack.y !== undefined) {
                a.y = pack.y
            }
        }
    }

})


socket.on('remove', function (data) {
    for (var i = 0; i < data.player.length; i++) {
        delete Player.list[data.player[i]]
    }
    for (var i = 0; i < data.bullet.length; i++) {
        delete Bullet.list[data.bullet[i]]
    }
    for (var i = 0; i < data.asteroid.length; i++) {
        delete Asteroids.list[data.asteroid[i]]
    }

})

setInterval(function () {
    if (!clientId)
        return;
    ctx.clearRect(0, 0, 800, 600)
    drawMap()
    for (var i in Player.list) {
        //Draw functions will go here
        Player.list[i].draw()
    }

    for (var i in Bullet.list) {
        //Draw functions will go here
        Bullet.list[i].draw()
    }

    for (var i in Asteroids.list) {
        //Draw functions will go here
        Asteroids.list[i].draw()
    }
    drawScore()
    drawHP()
}, 1000 / 30)

//event listeners for keypresses and mouse clicks and mouse posiition
document.addEventListener('keydown', keyPressDown)
document.addEventListener('keyup', keyPressUp)
document.addEventListener('mousedown', mouseDown)
document.addEventListener('mouseup', mouseUp)
document.addEventListener('mousemove', mouseMove)

function keyPressDown(e) {
    if (e.keyCode === 68)//right
        socket.emit('keypress', { inputId: 'right', state: true })
    else if (e.keyCode === 65)//left
        socket.emit('keypress', { inputId: 'left', state: true })
    else if (e.keyCode === 87)//up
        socket.emit('keypress', { inputId: 'up', state: true })
    else if (e.keyCode === 83)//down
        socket.emit('keypress', { inputId: 'down', state: true })
}

function keyPressUp(e) {

    if (e.keyCode === 68)//right
        socket.emit('keypress', { inputId: 'right', state: false })
    else if (e.keyCode === 65)//left
        socket.emit('keypress', { inputId: 'left', state: false })
    else if (e.keyCode === 87)//up
        socket.emit('keypress', { inputId: 'up', state: false })
    else if (e.keyCode === 83)//down
        socket.emit('keypress', { inputId: 'down', state: false })
}

function mouseDown(e) {
    socket.emit('keypress', { inputId: 'attack', state: true })
}

function mouseUp(e) {
    socket.emit('keypress', { inputId: 'attack', state: false })
}

function mouseMove(e) {
    var x = -px + e.clientX - 8 // do not need to fix player id and positions
    var y = -py + e.clientY - 96 // need to offset for header because 
    var angle = Math.atan2(y, x) / Math.PI * 180
    socket.emit('keypress', { inputId: 'mouseAngle', state: angle })
}




socket.on('addToChat', function (data) {
    chatText.innerHTML += `<div>${data}</div>`
})

socket.on('evalResponse', function (data) {
    chatText.innerHTML += `<div>${data}</div>`
    console.log(data)
})

chatForm.onsubmit = function (e) {
    e.preventDefault()

    if (chatInput.value[0] === '/') {
        socket.emit('evalServer', chatInput.value.slice(1))
    } else {
        socket.emit('sendMessageToServer', chatInput.value)
    }
    chatInput.value = ""
}



       
