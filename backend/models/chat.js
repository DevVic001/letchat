import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  room: { type: String, required: true },
  sender: { type: String, required: true },
  text: { type: String, required: true },
  time: { type: String, required: true },
}); 

const ChatDb = mongoose.model('Chat', chatSchema);

export default ChatDb;