import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from "socket.io"; 


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json()); 

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  }, 
}); 


io.on('connection', (socket) => {
  console.log('A user connected:', socket.id); 

    socket.on("join_room", (room) => {
  socket.join(room); // adds the socket to the specified room
  console.log(`User ${socket.id} joined room ${room}`);
}); 

socket.on("send_message", (data) => {
  socket.broadcast.to(data.room).emit("receive_message", data);
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
}); 


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});