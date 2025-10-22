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

  //this effect scrolls to the bottom of the chat when messages change
  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedRoom]);
  

  //join room on room change
  useEffect(() => {
  socket.emit("join_room", selectedRoom);
}, [selectedRoom]);



    // When a new message is received from server
  useEffect(() => { 
    
   socket.on("receive_message", (data) => {
  const isMe = data.sender === socket.id; 
  setChats(prev => ({
    ...prev,
    [data.room]: [...(prev[data.room] || []), {...data, sender: isMe ? 'me' : 'other'}]
  }));
});


    // cleanup on unmount
    return () => socket.off("receive_message");
  }, []);


  const sendMessage = () => {
    if (!message.trim()) return;
    
    setChats(prev => ({
      ...prev,
      [selectedRoom]: [...(prev[selectedRoom] || []), { text: message, sender: 'me', time: 'now' }]
    }));
    setMessage('');

    // Emit message to server 
    socket.emit("send_message", {
  text: message,
  room: selectedRoom, 
 sender: socket.id,
  time: "now"
});
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoom(roomId);
    setSidebarOpen(false); // Close sidebar on mobile after selection
  };

  const currentRoom = rooms.find(u => u.id === selectedRoom);

  return (
    <div style={styles.container}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
        html, body, #root {
          width: 100%;
          height: 100%;
          margin: 0;
          padding: 0;
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(0,255,136,0.4); }
          50% { box-shadow: 0 0 30px rgba(0,255,136,0.8); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .sidebar {
            position: fixed !important;
            left: ${sidebarOpen ? '0' : '-100%'} !important;
            top: 0 !important;
            bottom: 0 !important;
            width: 280px !important;
            max-width: 85vw !important;
            z-index: 1000 !important;
            transition: left 0.3s ease !important;
          }
          .overlay {
            display: ${sidebarOpen ? 'block' : 'none'} !important;
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
          .chat-area {
            width: 100% !important;
          }
          .header {
            padding: 15px 16px !important;
          }
          .messages {
            padding: 16px !important;
          }
          .input-area {
            padding: 12px 16px !important;
          }
          .message {
            max-width: 85% !important;
          }
          .button {
            padding: 12px 20px !important;
          }
        }
        @media (min-width: 769px) {
          .toggle-btn {
            display: none !important;
          }
        }
      `}</style>

      {/* Overlay for mobile */}
      <div className="overlay" onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
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

      {/* Chat Area */}
      <div style={styles.chatArea} className="chat-area">
        <div style={styles.header} className="header">
          <button 
            className="toggle-btn"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={styles.toggleBtn}
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
              <div style={{...styles.bubble, ...(msg.sender === 'me' ? styles.bubbleMe : styles.bubbleOther)}}>
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
    overflow: 'hidden',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  sidebar: {
    width: '280px',
    height: '100vh',
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
    position: 'relative',
    border: '2px solid #1a1a1a'
  },
  statusDot: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: '2px solid #111',
    animation: 'glow 2s infinite'
  },
  userName: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '2px'
  },
  userStatus: {
    fontSize: '11px',
    color: '#666',
    textTransform: 'capitalize'
  },
 chatArea: {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  height: '100vh',
  overflow: 'hidden',
  position: 'relative' 
},
  header: {
    padding: '20px 24px',
    background: '#111',
    borderBottom: '1px solid #1a1a1a',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flexShrink: 0
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
  headerStatus: {
    fontSize: '12px',
    color: '#00ff88',
    fontWeight: '500'
  },
  messages: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '24px',
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
    overflowWrap: 'break-word'
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
  position: 'sticky',   
  bottom: 0,          
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

export default ChatApp;