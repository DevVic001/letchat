import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

// ✅ Connect to backend Socket.IO server
const socket = io("https://letchat-6gfs.onrender.com", {
  transports: ["websocket"], 
});

const ChatApp = () => {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEnd = useRef(null);
 
  const rooms = [
    { id: 1, name: 'General', avatar: '🌐' },
    { id: 2, name: 'Tech Talk', avatar: '💻' },
    { id: 3, name: 'Random', avatar: '🎲' }
  ]

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedRoom]);
  
  useEffect(() => {
    socket.emit("join_room", selectedRoom);
  }, [selectedRoom]);

  useEffect(() => { 
    socket.on("receive_message", (data) => {
      const isMe = data.sender === socket.id; 
      setChats(prev => ({
        ...prev,
        [data.room]: [...(prev[data.room] || []), {...data, sender: isMe ? 'me' : 'other'}]
      }));
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    setChats(prev => ({
      ...prev,
      [selectedRoom]: [...(prev[selectedRoom] || []), { text: message, sender: 'me', time: 'now' }]
    }));
    setMessage('');

    socket.emit("send_message", {
      text: message,
      room: selectedRoom, 
      sender: socket.id,
      time: "now"
    });
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
    setSidebarOpen(false);
  };

  const currentRoom = rooms.find(u => u.id === selectedRoom);

  return (
    <div style={styles.container}>
      <style>{`
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        html, body, #root {
          width: 100%;
          height: 100vh;
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,136,0.4); }
          50% { box-shadow: 0 0 30px rgba(0,255,136,0.8); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .overlay { 
          display: none; 
        }
        
        .toggle-btn {
          display: none;
        }

        /* Mobile and tablet styles */
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            width: 280px !important;
            max-width: 80vw !important;
            z-index: 1000 !important;
            transform: ${sidebarOpen ? 'translateX(0)' : 'translateX(-100%)'};
            transition: transform 0.3s ease !important;
          }
          
          .overlay {
            display: ${sidebarOpen ? 'block' : 'none'};
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            background: rgba(0,0,0,0.7) !important;
            z-index: 999 !important;
          }
          
          .toggle-btn {
            display: flex !important;
          }
          
          .header {
            padding: 12px 16px !important;
          }
          
          .messages {
            padding: 16px !important;
            padding-top: 76px !important;
            padding-bottom: 80px !important;
          }
          
          .input-area {
            padding: 12px 16px !important;
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            background: #111 !important;
            border-top: 1px solid #1a1a1a !important;
            z-index: 1001 !important;
          }
          
          .message {
            max-width: 85% !important;
          }
          
          .button {
            padding: 12px 18px !important;
          }

          .input {
            font-size: 16px !important;
          }
        }

        @media (max-width: 480px) {
          .messages {
            padding: 12px !important;
            padding-top: 70px !important;
            padding-bottom: 75px !important;
          }
          
          .input-area {
            padding: 10px 12px !important;
          }
          
          .button {
            padding: 10px 16px !important;
            font-size: 13px !important;
          }
        }

        @media (min-width: 769px) {
          .toggle-btn {
            display: none !important;
          }
        }
      `}</style>

      <div className="overlay" onClick={() => setSidebarOpen(false)} />

      <div style={styles.sidebar} className="sidebar">
        <div style={styles.logo}>💬LetChat</div>
        {rooms.map(room => (
          <div
            key={room.id}
            onClick={() => handleRoomSelect(room.id)}
            style={{
              ...styles.room,
              ...(selectedRoom === room.id ? styles.roomActive : {})
            }}
          >
            <div style={styles.avatar}>
              {room.avatar} 
            </div>
            <div>
              <div style={styles.userName}>{room.name}</div> 
            </div>
          </div>
        ))}
      </div>

      <div style={styles.chatArea} className="chat-area">
        <div style={styles.header} className="header">
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.toggleBtn}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div style={styles.headerAvatar}>{currentRoom.avatar}</div>
          <div>
            <div style={styles.headerName}>{currentRoom.name}</div> 
          </div>
        </div>

        <div style={styles.messages} className="messages">
          {(chats[selectedRoom] || []).map((msg, i) => (
            <div key={i} style={{...styles.message, ...(msg.sender === 'me' ? styles.messageMe : {})}} className="message">
              <div style={{...styles.bubble, ...(msg.sender === 'me' ? styles.bubbleMe : styles.bubbleOther)}} className="bubble">
                {msg.text}
              </div>
              <div style={styles.time}>{msg.time}</div>
            </div>
          ))}
          <div ref={chatEnd} />
        </div>

        <div style={styles.inputArea} className="input-area">
          <input
            style={styles.input}
            className="input"
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
          <button style={styles.button} className="button" onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    background: '#0a0a0a',
    color: '#e0e0e0',
    overflow: 'hidden'
  },
  sidebar: {
    width: '280px',
    height: '100%',
    background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
    borderRight: '1px solid #1a1a1a',
    padding: '20px 0',
    flexShrink: 0,
    overflowY: 'auto'
  },
  logo: {
    fontSize: '22px',
    fontWeight: 'bold',
    background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    padding: '0 20px 20px',
    borderBottom: '1px solid #1a1a1a',
    marginBottom: '15px'
  },
  room: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    gap: '12px'
  },
  roomActive: {
    background: 'rgba(0,255,136,0.15)',
    borderLeft: '3px solid #00ff88'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    flexShrink: 0,
    border: '2px solid #1a1a1a'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '2px'
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    overflow: 'hidden',
    position: 'relative',
    background: '#0a0a0a'
  },
  header: {
    padding: '20px 24px',
    background: '#111',
    borderBottom: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  toggleBtn: {
    background: 'rgba(0,255,136,0.15)',
    border: '2px solid #00ff88',
    color: '#00ff88',
    fontSize: '20px',
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    cursor: 'pointer',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    flexShrink: 0
  },
  headerAvatar: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    background: '#1a1a1a',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    border: '2px solid #00ff88',
    boxShadow: '0 0 15px rgba(0,255,136,0.3)',
    flexShrink: 0
  },
  headerName: {
    fontSize: '16px',
    fontWeight: '700'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '24px',
    paddingTop: '90px',
    paddingBottom: '100px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  message: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '65%',
    animation: 'fadeIn 0.3s ease'
  },
  messageMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end'
  },
  bubble: {
    padding: '12px 16px',
    borderRadius: '16px',
    fontSize: '14px',
    lineHeight: '1.4',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    wordBreak: 'break-word'
  },
  bubbleOther: {
    background: '#1a1a1a',
    color: '#e0e0e0'
  },
  bubbleMe: {
    background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
    color: '#000',
    fontWeight: '500',
    animation: 'glow 3s infinite'
  },
  time: {
    fontSize: '10px',
    color: '#666',
    marginTop: '4px',
    padding: '0 4px'
  },
  inputArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    padding: '20px 24px',
    background: '#111',
    borderTop: '1px solid #1a1a1a',
    display: 'flex',
    gap: '12px',
    flexShrink: 0,
    zIndex: 10
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    background: '#1a1a1a',
    border: '2px solid #222',
    borderRadius: '10px',
    color: '#e0e0e0',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.3s',
    minWidth: 0
  },
  button: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #00ff88, #00cc6a)',
    color: '#000',
    border: 'none',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    animation: 'glow 3s infinite',
    flexShrink: 0,
    whiteSpace: 'nowrap'
  }
};

export default ChatApp;aimport { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const socket = io("https://letchat-6gfs.onrender.com", {
  transports: ["websocket"], 
});

const ChatApp = () => {
  const [selectedRoom, setSelectedRoom] = useState(1);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEnd = useRef(null);
 
  const rooms = [
    { id: 1, name: 'General', avatar: '🌐' },
    { id: 2, name: 'Tech Talk', avatar: '💻' },
    { id: 3, name: 'Random', avatar: '🎲' }
  ]

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedRoom]);
  
  useEffect(() => {
    socket.emit("join_room", selectedRoom);
  }, [selectedRoom]);

  useEffect(() => { 
    socket.on("receive_message", (data) => {
      const isMe = data.sender === socket.id; 
      setChats(prev => ({
        ...prev,
        [data.room]: [...(prev[data.room] || []), {...data, sender: isMe ? 'me' : 'other'}]
      }));
    });

    return () => socket.off("receive_message");
  }, []);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    setChats(prev => ({
      ...prev,
      [selectedRoom]: [...(prev[selectedRoom] || []), { text: message, sender: 'me', time: 'now' }]
    }));
    setMessage('');

    socket.emit("send_message", {
      text: message,
      room: selectedRoom, 
      sender: socket.id,
      time: "now"
    });
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
    setSidebarOpen(false);
  };

  const currentRoom = rooms.find(u => u.id === selectedRoom);

  return (
    <>
      <style>{`
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        html, body, #root {
          width: 100%;
          height: 100%;
          overflow: hidden;
        }
        
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,136,0.4); }
          50% { box-shadow: 0 0 30px rgba(0,255,136,0.8); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .app-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          background: #0a0a0a;
          color: #e0e0e0;
          overflow: hidden;
        }

        .sidebar {
          width: 280px;
          height: 100vh;
          background: linear-gradient(180deg, #111 0%, #0a0a0a 100%);
          border-right: 1px solid #1a1a1a;
          padding: 20px 0;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .logo {
          font-size: 22px;
          font-weight: bold;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          padding: 0 20px 20px;
          border-bottom: 1px solid #1a1a1a;
          margin-bottom: 15px;
        }

        .room {
          display: flex;
          align-items: center;
          padding: 12px 20px;
          cursor: pointer;
          transition: all 0.2s;
          gap: 12px;
        }

        .room:hover {
          background: rgba(0,255,136,0.05);
        }

        .room-active {
          background: rgba(0,255,136,0.15);
          border-left: 3px solid #00ff88;
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          border: 2px solid #1a1a1a;
          flex-shrink: 0;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
        }

        .chat-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100vh;
          overflow: hidden;
          background: #0a0a0a;
        }

        .header {
          padding: 20px 24px;
          background: #111;
          border-bottom: 1px solid #1a1a1a;
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 85px;
        }

        .toggle-btn {
          display: none;
          background: rgba(0,255,136,0.15);
          border: 2px solid #00ff88;
          color: #00ff88;
          font-size: 20px;
          width: 40px;
          height: 40px;
          border-radius: 8px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }

        .header-avatar {
          width: 45px;
          height: 45px;
          border-radius: 50%;
          background: #1a1a1a;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
          border: 2px solid #00ff88;
          box-shadow: 0 0 15px rgba(0,255,136,0.3);
          flex-shrink: 0;
        }

        .header-name {
          font-size: 16px;
          font-weight: 700;
        }

        .messages-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
          flex-direction: column;
          max-width: 65%;
          animation: fadeIn 0.3s ease;
        }

        .message-me {
          align-self: flex-end;
          align-items: flex-end;
        }

        .bubble {
          padding: 12px 16px;
          border-radius: 16px;
          font-size: 14px;
          line-height: 1.4;
          word-wrap: break-word;
        }

        .bubble-other {
          background: #1a1a1a;
          color: #e0e0e0;
        }

        .bubble-me {
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #000;
          font-weight: 500;
          animation: glow 3s infinite;
        }

        .time {
          font-size: 10px;
          color: #666;
          margin-top: 4px;
          padding: 0 4px;
        }

        .input-container {
          padding: 20px 24px;
          background: #111;
          border-top: 1px solid #1a1a1a;
          display: flex;
          gap: 12px;
          min-height: 85px;
          align-items: center;
        }

        .input {
          flex: 1;
          padding: 12px 16px;
          background: #1a1a1a;
          border: 2px solid #222;
          border-radius: 10px;
          color: #e0e0e0;
          font-size: 14px;
          outline: none;
        }

        .input:focus {
          border-color: #00ff88;
        }

        .send-btn {
          padding: 12px 24px;
          background: linear-gradient(135deg, #00ff88, #00cc6a);
          color: #000;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          animation: glow 3s infinite;
        }

        .send-btn:active {
          transform: scale(0.95);
        }

        .overlay {
          display: none;
        }

        @media (max-width: 768px) {
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            bottom: 0;
            width: 280px;
            max-width: 80vw;
            z-index: 1000;
            transform: translateX(${sidebarOpen ? '0' : '-100%'});
            transition: transform 0.3s ease;
          }

          .overlay {
            display: ${sidebarOpen ? 'block' : 'none'};
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            z-index: 999;
          }

          .toggle-btn {
            display: flex;
          }

          .header {
            padding: 15px 16px;
            min-height: 70px;
          }

          .messages-container {
            padding: 16px;
          }

          .input-container {
            padding: 12px 16px;
            min-height: 70px;
          }

          .input {
            font-size: 16px;
          }

          .send-btn {
            padding: 12px 20px;
          }

          .message {
            max-width: 85%;
          }
        }

        @media (max-width: 480px) {
          .sidebar {
            width: 260px;
          }

          .header {
            padding: 12px;
            min-height: 65px;
          }

          .messages-container {
            padding: 12px;
          }

          .input-container {
            padding: 10px 12px;
            min-height: 65px;
            gap: 8px;
          }

          .send-btn {
            padding: 10px 16px;
            font-size: 13px;
          }

          .message {
            max-width: 90%;
          }
        }
      `}</style>

      <div className="app-container">
        <div className="overlay" onClick={() => setSidebarOpen(false)} />

        <div className="sidebar">
          <div className="logo">💬LetChat</div>
          {rooms.map(room => (
            <div
              key={room.id}
              onClick={() => handleRoomSelect(room.id)}
              className={`room ${selectedRoom === room.id ? 'room-active' : ''}`}
            >
              <div className="avatar">{room.avatar}</div>
              <div className="user-name">{room.name}</div>
            </div>
          ))}
        </div>

        <div className="chat-container">
          <div className="header">
            <button 
              className="toggle-btn"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="header-avatar">{currentRoom.avatar}</div>
            <div className="header-name">{currentRoom.name}</div>
          </div>

          <div className="messages-container">
            {(chats[selectedRoom] || []).map((msg, i) => (
              <div key={i} className={`message ${msg.sender === 'me' ? 'message-me' : ''}`}>
                <div className={`bubble ${msg.sender === 'me' ? 'bubble-me' : 'bubble-other'}`}>
                  {msg.text}
                </div>
                <div className="time">{msg.time}</div>
              </div>
            ))}
            <div ref={chatEnd} />
          </div>

          <div className="input-container">
            <input
              className="input"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            />
            <button className="send-btn" onClick={sendMessage}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChatApp;