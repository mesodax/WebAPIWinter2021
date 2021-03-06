        var socket = io()
        var canvas = document.getElementById('canvas')
        var ctx = canvas.getContext('2d')
        var chatText=document.getElementById('chat-text')
        var chatInput=document.getElementById('chat-input')
        var chatForm=document.getElementById('chat-form')
        ctx.font = '30px Arial'
        

        //event listeners
        document.addEventListener('keydown', keyPressDown)
        document.addEventListener('keyup', keyPressUp)
        document.addEventListener('mousedown',mouseDown)
        document.addEventListener('mouseup',mouseUp)
        document.addEventListener('mousemove',mouseMove)

        function keyPressDown(e)
        {
            if(e.keyCode===38)//up
            socket.emit('keypress', {inputId:'up', state:true})
            if(e.keyCode===40)//down
            socket.emit('keypress', {inputId:'down', state:true})
            if(e.keyCode===37)//left
            socket.emit('keypress', {inputId:'left', state:true})
            if(e.keyCode===39)//right
            socket.emit('keypress', {inputId:'right', state:true})
        }

        function keyPressUp(e)
        {
            if(e.keyCode===38)//up
            socket.emit('keypress', {inputId:'up', state:false})
            if(e.keyCode===40)//down
            socket.emit('keypress', {inputId:'down', state:false})
            if(e.keyCode===37)//left
            socket.emit('keypress', {inputId:'left', state:false})
            if(e.keyCode===39)//right
            socket.emit('keypress', {inputId:'right', state:false})
        }

        function mouseDown(e)
        {
            socket.emit('keypress', {inputId:'attack', state:true})
        }

        function mouseUp(e)
        {
            socket.emit('keypress', {inputId:'attack', state:false})
        }

        function mouseMove(e)
        {
            var x = -400 + e.clientX - 8
            var y = -300 + e.clientY - 96
            var angle = Math.atan(y,x)/Math.PI*180
            socket.emit('keypress', {inputId:'mouseAngle', state:angle})
        }

        socket.on('newPosition', function(data)
        {
            ctx.clearRect(0,0,canvas.width, canvas.height)
            for(var i = 0; i<data.player.length;i++)
            {
            ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y)
            }

            for(var i = 0; i<data.bullet.length;i++)
            {
            ctx.fillRect(data.bullet[i].x, data.bullet[i].y,10,10)
            }
        })

        socket.on('addToChat',function(data){
            chatText.innerHTML = `<div>${data}</div>`
        })

        socket.on('evalResponse',function(data){
            chatText.innerHTML = `<div>${data}</div>`
            console.log(data)
        })

       

        chatForm.onsubmit = function(e)
        {
            e.preventDefault()

            if(chatInput.value[0]==='/')
            {
            socket.emit('evalServer',chatInput.value.slice(1))
            }
            else
            {
                socket.emit('sendMessageToServer', chatInput.value)
            }
            socket.emit('sendMessageToServer', chatInput.value)
            chatInput.value = ""
        }


        //example code from wednesday
        // var msg = function(){
        //     socket.emit('sendBtnMsg', {
        //     message: "Stop pushing my buttons"
        // })
        // }

        // socket.emit('sendMsg', {
        //     message: "G A M E R"
        // })

        // socket.on('messageFromServer', function (data) {
        //     console.log(data.message)
        // })