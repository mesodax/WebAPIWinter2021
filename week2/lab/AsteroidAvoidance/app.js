var express = require('express')
var app = express()
var mongoose = require('mongoose')
var path = require('path')
var port = 5000


app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/views/index.html'))

})

app.use(express.static(__dirname + '/views'))


app.listen(port,function(){
    console.log("Listening on port 5000")
})

mongoose.connect('mongodb://localhost:27017/gameEntries',{
    useNewUrlParser:true
}).then(function()
{
    console.log("Connected to Mongo data")
}).catch(function(err){
    console.log(err)
})

app.post('/saveGame',function(req,res){
    console.log("request has been made")
    console.log(req.body)
    
    })
    
    app.get('/getData',function(req,res){
        Game.find({}).then(function(game){
            res.json({game})
        })
    })