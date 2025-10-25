💬 LetChat — Real-Time Web Chat App

LetChat is a full-stack, real-time chat application built with React (frontend) and Node.js + Express + Socket.IO (backend). It enables instant room-based messaging with a smooth, modern UI and reliable WebSocket communication.

🚀 Features

✅ Real-time chat via Socket.IO (WebSocket transport)
✅ Multiple chat rooms
✅ Auto-scroll to latest message
✅ Unique user session per browser tab
✅ Responsive design for all screens
✅ Smooth transitions and glowing animations

🧠 Tech Stack
Layer	Technology
Frontend	React (Hooks, useState, useEffect, useRef)
Backend	Node.js + Express + Socket.IO
Styling	CSS + Media Queries
Session Storage	sessionStorage (client-side unique ID)
Optional Database	MongoDB
⚙️ Project Structure
letchat/
 ├── backend/
 │    ├── server.js           # Express + Socket.IO backend
 │    ├── package.json
 │    └── ...
 ├── frontend/
 │    ├── src/
 │    │    ├── ChatApp.jsx    # Main chat component
 │    │    └── index.js       # React entry point
 │    ├── package.json
 │    └── ...
 └── README.md

🧩 Backend Setup
1️⃣ Navigate to backend folder
cd backend

2️⃣ Install dependencies
npm install

3️⃣ Start backend server
node server.js


Your backend should now be running on http://localhost:5000

Example server.js:

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL (Vite default)
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  socket.on("send_message", (data) => {
    io.to(data.room).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`✅ Backend running on port ${PORT}`));

💻 Frontend Setup
1️⃣ Navigate to frontend folder
cd frontend

2️⃣ Install dependencies
npm install

3️⃣ Run development server
npm run dev


Your frontend will start on http://localhost:5173

Make sure your frontend connects to the backend:

// inside ChatApp.jsx
import { io } from "socket.io-client";
const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

🔄 Communication Flow

The frontend connects to the backend via Socket.IO.

Each browser tab gets a unique sessionStorage ID.

When a message is sent, it’s emitted to the backend with the room info.

The backend broadcasts it to all clients in that room.

The frontend updates the UI and auto-scrolls to the new message.

🧰 Available Commands

Frontend:

npm run dev       # Start Vite dev server
npm run build     # Build for production


Backend:

node server.js    # Start Express + Socket.IO server

🖼️ UI Overview
💬 Chat Interface	🌐 Room Sidebar	📱 Mobile View
Real-time messages	Room switching	Responsive layout
🧠 Future Enhancements

🔐 JWT authentication

🗄️ Save chat history to MongoDB

🟢 Online user list  

👨‍💻 Author

Victor Emmy (Adebowale Victor)
Senior Software Developer — Backend & Realtime Systems
📧 victoremmy1876@gmail.com

🌐 VICOTECH Digital Services

📜 License

This project is licensed under the MIT License — free to use, modify, and distribute.