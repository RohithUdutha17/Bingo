const app = require('express')()
var http = require('http')
const {Server} = require('socket.io')
const cors = require('cors')
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
        console.log(io.sockets.adapter.rooms.get(data.roomno));
        const clients = io.sockets.adapter.rooms.get(data.roomno) == undefined ? 0 :io.sockets.adapter.rooms.get(data.roomno).size;
        console.log(clients);
        if(clients < 2){
            socket.join(data.roomno)
        }
        if(clients <= 2){
            const newData = {...data,clients}
            console.log(newData);
            socket.to(data.roomno).emit("userConnected",newData)
        }
        console.log('User connected with id',socket.id,data.roomno);
        console.log(io.sockets.adapter.rooms.get(data.roomno).size);
    })
    
    socket.on("leave_room",(data)=>{
        socket.leave(data)
        socket.to(data.room).emit("left_room",data);
    })

    socket.on("updatemarks",(data)=>{
        socket.to(data.roomno).emit("receivemarks",data)
        console.log(io.sockets.adapter.rooms.get(data.roomno).size);
    })

    socket.on("winner",(data)=>{
        console.log(data);
        socket.to(data.roomno).emit('updatewinner',data);
    })

    socket.on("refreshPage",(data)=>{
        console.log("refresh",data);
        socket.to(data.roomno).emit('refresh',data);
    })
    // socket.on("reset",()=>{
    //     socket.broadcast.emit("resetData");
    // })
})
 server.listen(8000,()=>{
    console.log("server is running");
 });

// const io = require('socket.io')(8000,
//     {
//         cors:{
//             origin:["http:localhost:3000"],
//         }
//     }
//     )

io.on('connection',socket=>{
    //console.log(socket.id);
})