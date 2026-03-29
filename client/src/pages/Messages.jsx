import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getInbox, getConversation, sendMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import './Messages.css';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const Messages = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected]           = useState(null);
  const [messages, setMessages]           = useState([]);
  const [newMsg, setNewMsg]               = useState('');
  const [loading, setLoading]             = useState(true);
  const [sending, setSending]             = useState(false);
  const socketRef  = useRef(null);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Load inbox
  useEffect(() => {
    getInbox()
      .then(res => {
        // Group messages by room
        const rooms = {};
        res.data.messages.forEach(msg => {
          if (!rooms[msg.room]) rooms[msg.room] = { ...msg, unread: 0 };
          if (!msg.read && msg.receiver?._id === user._id) rooms[msg.room].unread++;
        });
        setConversations(Object.values(rooms));
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  // Socket setup
  useEffect(() => {
    socketRef.current = io(SOCKET_URL);
    return () => socketRef.current?.disconnect();
  }, []);

  // Open conversation
  const openConversation = async (conv) => {
    setSelected(conv);
    const otherId = conv.sender?._id === user._id ? conv.receiver?._id : conv.sender?._id;
    try {
      const res = await getConversation(otherId, conv.item?._id);
      setMessages(res.data.messages);
      const room = conv.room;
      socketRef.current?.emit('join_room', room);
      socketRef.current?.on('receive_message', (data) => {
        setMessages(prev => [...prev, data]);
      });
    } catch {
      setMessages([]);
    }
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Send message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selected) return;
    setSending(true);
    const otherId = selected.sender?._id === user._id ? selected.receiver?._id : selected.sender?._id;
    try {
      const res = await sendMessage({
        receiverId: otherId,
        itemId: selected.item?._id,
        content: newMsg,
      });
      const msgData = { ...res.data.message, room: selected.room };
      setMessages(prev => [...prev, msgData]);
      socketRef.current?.emit('send_message', { ...msgData, room: selected.room });
      setNewMsg('');
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch {
      alert('Failed to send message');
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const getOtherUser = (conv) =>
    conv.sender?._id === user._id ? conv.receiver : conv.sender;

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString('en-IN');
  };

  return (
    <div className="msg-root">
      <div className="msg-container">

        {/* LEFT — Inbox */}
        <div className={`msg-inbox ${selected ? 'inbox-hidden-mobile' : ''}`}>
          <div className="inbox-header">
            <h2 className="inbox-title">💬 Messages</h2>
            <span className="inbox-count">{conversations.length}</span>
          </div>

          {loading ? (
            <div className="msg-loading">
              <div className="loading-spinner"></div>
            </div>
          ) : conversations.length === 0 ? (
            <div className="inbox-empty">
              <div className="empty-icon">📭</div>
              <p>No messages yet</p>
              <span>When you contact someone about an item, messages will appear here</span>
              <Link to="/" className="browse-link">Browse Items →</Link>
            </div>
          ) : (
            <div className="conv-list">
              {conversations.map((conv, i) => {
                const other = getOtherUser(conv);
                const isSelected = selected?.room === conv.room;
                return (
                  <div
                    key={i}
                    className={`conv-item ${isSelected ? 'conv-active' : ''}`}
                    onClick={() => openConversation(conv)}
                  >
                    <div className="conv-avatar">
                      {other?.avatar
                        ? <img src={other.avatar} alt="av" />
                        : <span>{other?.name?.charAt(0).toUpperCase() || '?'}</span>
                      }
                    </div>
                    <div className="conv-info">
                      <div className="conv-top">
                        <span className="conv-name">{other?.name || 'Unknown'}</span>
                        <span className="conv-time">{formatTime(conv.createdAt)}</span>
                      </div>
                      <div className="conv-bottom">
                        <span className="conv-item-name">
                          {conv.item?.title || 'Item'}
                        </span>
                        {conv.unread > 0 && (
                          <span className="conv-unread">{conv.unread}</span>
                        )}
                      </div>
                      <p className="conv-preview">{conv.content}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT — Chat */}
        {selected ? (
          <div className="msg-chat">
            {/* Chat Header */}
            <div className="chat-header">
              <button className="chat-back" onClick={() => setSelected(null)}>←</button>
              <div className="chat-avatar">
                {getOtherUser(selected)?.avatar
                  ? <img src={getOtherUser(selected).avatar} alt="av" />
                  : <span>{getOtherUser(selected)?.name?.charAt(0).toUpperCase() || '?'}</span>
                }
              </div>
              <div className="chat-header-info">
                <div className="chat-name">{getOtherUser(selected)?.name}</div>
                <Link to={`/items/${selected.item?._id}`} className="chat-item-link">
                  📦 {selected.item?.title}
                </Link>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.length === 0 ? (
                <div className="chat-empty">
                  <p>No messages yet — say hello!</p>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender?._id === user._id || msg.sender === user._id;
                  return (
                    <div key={i} className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                      <div className={`msg-bubble ${isMine ? 'bubble-mine' : 'bubble-theirs'}`}>
                        <p>{msg.content}</p>
                        <span className="msg-time">{formatTime(msg.createdAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <form className="chat-input-area" onSubmit={handleSend}>
              <input
                ref={inputRef}
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Type a message..."
                className="chat-input"
                disabled={sending}
              />
              <button type="submit" className="chat-send-btn" disabled={sending || !newMsg.trim()}>
                {sending ? '...' : '➤'}
              </button>
            </form>
          </div>
        ) : (
          <div className="msg-no-chat">
            <div className="no-chat-icon">💬</div>
            <h3>Select a conversation</h3>
            <p>Choose a message from the left to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
