const app = require('express')()
const express = require('express')
var http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')
const path = require('path')

app.use(express.static(path.join(__dirname, '../../build')))
app.use(cors())

const server = http.createServer(app);
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
    }
})

io.on("connection",(socket)=>{
    console.log(`User connected ${socket.id}`);

    socket.on("join_room",(data)=>{
        const clients = io.sockets.adapter.rooms.get(data.roomno) == undefined ? 0 :io.sockets.adapter.rooms.get(data.roomno).size;
        if(clients < 2){
            socket.join(data.roomno)
        }
        if(clients <= 2){
            const newData = {...data,clients}
            socket.to(data.roomno).emit("userConnected",newData)
        }
    })
    
    socket.on("leave_room",(data)=>{
        socket.leave(data)
        socket.to(data.room).emit("left_room",data);
    })

    socket.on("updatemarks",(data)=>{
        socket.to(data.roomno).emit("receivemarks",data)
    })

    socket.on("winner",(data)=>{
        socket.to(data.roomno).emit('updatewinner',data);
    })

    socket.on("refreshPage",(data)=>{
        socket.to(data.roomno).emit('refresh',data);
    })
})
 server.listen(8000,()=>{
    console.log("server is running");
 });