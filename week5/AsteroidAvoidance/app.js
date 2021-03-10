var express = require('express')
var app = express()
var path = require('path')
var serv = require('http').Server(app)
var io = require('socket.io')(serv, {})
var port = 3000




app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'))

})

app.use(express.static(__dirname + '/views'))


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

//server side comm
io.sockets.on('connection', function (socket) {
    console.log("socket connected")

    socket.id = Math.random()
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

setInterval(function(){
    var pack =
    {
        player:Player.update(),
    }
//var pack = Player.update();
for(var i in SocketList){
    var socket = SocketList[i]
    socket.emit('newPosition', pack)
}
},1000/30)

app.post('/saveGame',function(req,res){
    console.log("request has been made")
    console.log(req.body)
    
})
    
    app.get('/getData',function(req,res){
        Game.find({}).then(function(game){
            res.json({game})
        })
    })
