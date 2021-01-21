var express = require('express')
var app = express()
var path = require('path')
var port = 3000
var WebSocketServer = require('ws').Server,
wss = new WebSocketServer({port:4000}),
clients = [],
messages = []

app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'))

})
wss.on('connection', function(ws){

var index = clients.push(ws) - 1;
console.log(wss.clients)
var msgText = messages.join('<br>')
ws.send(msgText)

ws.on('message', function(message)
    {   
        messages.push(message)
        console.log('received: %s from %s', message, index);

        wss.clients.forEach(function(conn){
            conn.send(message)
        })
    })
})


app.use(express.static(__dirname + '/views'))

app.listen(port, function () {
    console.log("connected to port 3000")
})