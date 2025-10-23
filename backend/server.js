import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from "socket.io"; 
import mongoose from 'mongoose';
import dotenv from 'dotenv'; 
import ChatDb from './models/chat.js';

dotenv.config();


const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());  

mongoose.connect(process.env.MONGO_URL).then(()=>{
  console.log("Connected to MongoDB");
}).catch((err)=>{
  console.error("Error connecting to MongoDB:", err);
});

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

socket.on("send_message", async (data) => { 
  try {
    // Save to MongoDB
    const newMessage = new ChatDb({
      text: data.text,
      room: data.room,
      sender: data.sender,
      time: data.time
    });
    await newMessage.save();
    
    // Broadcast to room including sender
    io.in(data.room).emit('receive_message', {
      text: data.text,
      room: data.room,
      sender: data.sender,
      time: data.time
    });
  } catch (error) {
    console.error('Error saving message:', error);
  }
});

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});    


app.get('/api/messages/:selectedRoom', async (req, res)=> {
   //fetch chats for a particular room
   try{
   const chats = await ChatDb.find({
    room: parseInt(req.params.selectedRoom)
   }).sort({ time: 1 });
   res.status(200).json({chats: chats}) 
  } catch(err) {
    res.status(500).json({message: 'An error occured'})
  }
});


server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});