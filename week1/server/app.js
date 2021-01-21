//app is the entry point of the application

var http = require('http')

http.createServer(function(request, response){
    //http header
    response.writeHead(200,{'Content-type':'text/plain'})
    //Send a response to the body of the html
    response.end("Wouldnt you like to be a pepper too??")
}).listen(3000)

console.log("Sever is running on port 3000")