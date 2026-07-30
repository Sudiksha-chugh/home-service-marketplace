import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { toast } from 'react-toastify';
import { MessageSquare, Send, X, User } from 'lucide-react';

export default function ChatModal({ bookingId, currentUser, role, onClose, onStatusUpdate }) {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Connect socket
    const newSocket = io('http://localhost:8000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    // Join room
    newSocket.emit('joinRoom', { bookingId });

    // Fetch initial chat history
    fetchChatHistory();

    // Listen for live status update
    newSocket.on('statusUpdate', (data) => {
      if (data.bookingId === bookingId) {
        toast.info(`Job status updated live to: ${data.status.toUpperCase()}`);
        if (onStatusUpdate) onStatusUpdate(data);
      }
    });

    // Listen for incoming message
    newSocket.on('receiveMessage', (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollToBottom();
    });

    return () => {
      newSocket.emit('leaveRoom', { bookingId });
      newSocket.disconnect();
    };
  }, [bookingId]);

  const fetchChatHistory = async () => {
    try {
      const res = await api.get(`/booking/${bookingId}/chat`);
      if (res.data.success) {
        setMessages(res.data.messages);
        scrollToBottom();
      }
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMsg.trim() || !socket || !currentUser) return;

    socket.emit('sendMessage', {
      bookingId,
      senderId: currentUser.id || currentUser._id,
      senderRole: role,
      message: inputMsg.trim(),
    });

    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full h-[520px] shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Live Job Chat</h3>
              <span className="text-[10px] text-slate-400 font-mono">Booking ID: {bookingId}</span>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No messages yet. Send a message to start communicating live!
            </div>
          ) : (
            messages.map((msg) => {
              const senderId = typeof msg.sender === 'object' ? msg.sender?._id : msg.sender;
              const currentId = currentUser?.id || currentUser?._id;
              const isMine = senderId === currentId || msg.senderRole === role;

              return (
                <div key={msg._id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl p-3 text-xs shadow-sm space-y-1 ${
                      isMine
                        ? 'bg-brand-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px] opacity-75 font-semibold">
                      <span>{msg.sender?.name || (isMine ? 'You' : msg.senderRole)}</span>
                      <span>
                        {new Date(msg.timestamp || msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="leading-relaxed font-medium">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Footer */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            className="bg-brand-600 hover:bg-brand-700 text-white p-2.5 rounded-xl shadow-sm transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
