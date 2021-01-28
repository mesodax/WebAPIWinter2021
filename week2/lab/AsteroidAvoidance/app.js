var express = require('express')
var app = express()
var path = require('path')
var port = 5000


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'))

})

app.use(express.static(__dirname + '/views'))


app.listen(port,function(){
    console.log("Listening on port 5000")
})