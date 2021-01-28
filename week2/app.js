var express = require('express')
var mongoose = require('mongoose')
var app = express()
var path = require('path')
var bodyparser = require('body-parser')
var router = express.Router()


//sets up middle ware
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.json())

mongoose.connect('mongodb://localhost:27017/gameEntries',{
    useNewUrlParser:true
}).then(function()
{
    console.log("Connected to Mongo data")
}).catch(function(err){
    console.log(err)
})

require('./models/Game');
var Game = mongoose.model('game')


app.post('/saveGame',function(req,res){
console.log("request has been made")
console.log(req.body)

new Game(req.body).save().then(function(){
    res.redirect('gamelist.html')
})

})

app.get('/getData',function(req,res){
    Game.find({}).then(function(game){
        res.json({game})
    })
})

app.post('/deleteGame',function(req,res){
    console.log("Game Deleted", req.body._id)
    Game.findByIdAndDelete(req.body._id).exec()
    res.redirect('gamelist.html')
})

app.use(express.static(__dirname+"/views"))
app.listen(3000,function(){
    console.log("Listening on port 3000")
})

