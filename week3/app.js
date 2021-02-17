var express = require('express')
var app = express()
var serv = require('http').Server(app)
var io = require('socket.io')(serv, {})
var debug = true


//file comm
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/client/index.html')
})

app.use('/client', express.static(__dirname + '/client'))

serv.listen(3000, function () {
    console.log('Connected on localhost 3000')
})

var SocketList = {}


var GameObject = function()
{
    var self ={
        x:400,
        y:300,
        spX:0,
        spY:0,
        id:"",
        
    }

    self.update=function()
    {
        self.updatePosition()
    }
    self.updatePosition = function(){
        self.x +=self.spX
        self.y += self.spY
    }

    self.getDist=function(point)
    {
        return Math.sqrt(Math.pow(self.x-point.x))
    }
    return self
}

var Player = function(id)
{

    var self = GameObject()
   
    self.id = id
    self.number = Math.floor(Math.random()*10)
    self.right = false
    self.left = false
    self.up = false
    self.down = false
    self.attack = false
    self.mouseAngle = 0
    self.speed = 10

    var playerUpdate = self.update

    self.update = function()
    {
        self.updateSpeed()
        playerUpdate()
        if(self.attack)
        {
            self.shoot(self.mouseAngle)
        }
    }

    self.shoot = function(angle)
    {
        var b = Bullet(angle);
        b.x = self.x;
        b.y = self.y;
    }

    self.updateSpeed = function()
    {
        if(self.right)
        {
            self.spX = self.speed
        }
        else if (self.left)
        {
            self.spX = -self.speed
        }
        else{
            self.spX=0
        }

        if(self.up)
        {
            self.spY = -self.speed
        }
        else if (self.down)
        {
            self.spY = self.speed
        }
        else{
            self.spY=0
        }
    }


    Player.list[id]=self
    return self
}

Player.list={}

Player.onConnect = function(socket)
{
    var player = new Player(socket.id)

    socket.on('keypress', function(data){
        if(data.inputId === "up")
        player.up=data.state
        if(data.inputId  === "down")
        player.down=data.state
        if(data.inputId  === "left")
        player.left=data.state
        if(data.inputId  === "right")
        player.right=data.state
        if(data.inputId  === "attack")
        player.attack=data.state
        if(data.inputId  === "mouseAngle")
        player.mouseAngle=data.state
    })
}

Player.onDisconnect = function(socket)
{
    delete Player.list[socket.id]
}

Player.update = function()
{
    var pack = []
    for(var i in Player.list){
    var player = Player.list[i]
    player.update()
    pack.push({
        x:player.x,
        y:player.y,
        number:player.number
    })
}
return pack
}

var Bullet = function(angle){
    var self = GameObject()
    self.id = Math.random()
    self.spX = Math.cos(angle/180*Math.PI)*10
    self.spY = Math.sin(angle/180*Math.PI)*10

    self.timer = 0
    self.toRemove = false

    var bulletUpdate = self.update
    self.update = function(){
        if(self.timer++ > 100)
        {
            self.toRemove = true
        }
        
        bulletUpdate()
    }
    Bullet.list[self.id]=self
    return self
}
Bullet.list={}
Bullet.update = function()
{

    //if(Math.random() < 0.1)
    //{
    //    Bullet(Math.random()*360)
    //}
    var pack = []
    for(var i in Bullet.list){
    var bullet = Bullet.list[i]
    bullet.update()
    pack.push({
        x:bullet.x,
        y:bullet.y,
      
    })
}
return pack
}

//server side comm
io.sockets.on('connection', function (socket) {
    console.log("socket connected")

    socket.id = Math.random()
    // socket.x = 0
    // socket.y = Math.floor(Math.random()*600)
    // socket.number = Math.floor(Math.random()*10)
    //add something to socketlist
    SocketList[socket.id]= socket 
    Player.onConnect(socket)



    socket.on('disconnect', function(){
        delete SocketList[socket.id]
        Player.onDisconnect(socket)
    })

    socket.on('sendMessageToServer', function(data){
        var playerName = (" "+socket.id).slice(2,7)
        for(var i in SocketList){
            SocketList[i].emit('addToChat',playerName + ": "+ data)
        }
    })

    socket.on('evalServer',function(data)
    {
        if(!debug)
        {
            return
        }
        var res = eval(data)
        socket.emit('evalResponse', res)
    })



})

//setup update loop
setInterval(function(){
    var pack =
    {
        player:Player.update(),
        bullet:Bullet.update()
    }
//var pack = Player.update();
for(var i in SocketList){
    var socket = SocketList[i]
    socket.emit('newPosition', pack)
}
},1000/30)