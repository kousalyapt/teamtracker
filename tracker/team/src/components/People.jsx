import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import { getCable } from '../cable';
import { MdMoreVert } from "react-icons/md";

const People = () => {
  const [allPeople, setAllPeople] = useState([]);
  const [chatPeople, setChatPeople] = useState([]);
  const [filteredPeople, setFilteredPeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [cookies] = useCookies(['jwt']);
  const [chatId, setChatId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showDropdown, setShowDropdown] = useState(null);
  const [editedComment, setEditedComment] = useState(null);
  const [editedContent, setEditedContent] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSelectMessage = (e, msgId) => {
    if (e.target.classList.contains("dots")) return;
    setSelectedMessage(msgId === selectedMessage ? null : msgId);
    setShowDropdown(null);
  };

  const handleDropdown = (e, msgId) => {
    e.stopPropagation();
    setSelectedMessage(msgId);
    setShowDropdown(msgId === showDropdown ? null : msgId);
  };

  const handleEditMessage = (msg) => {
    setEditedComment(msg.id);
    setEditedContent(msg.content);
    setShowDropdown(null);
  };

  const handleDeleteMessage = async (msgId) => {
    try {
      await axios.delete(`http://localhost:3000/chats/${chatId}/messages/${msgId}`, {
        headers: {
          Authorization: `${cookies.jwt}`
        }
      });
      setMessages(prevMessages => prevMessages.filter(msg => msg.id !== msgId));
    } catch (e) {
      console.log("Error deleting message:", e);
    }
  };

  const handleSaveEditedMessage = async (msgId) => {
    try {
      const response = await axios.patch(`http://localhost:3000/chats/${chatId}/messages/${msgId}`,
        { content: editedContent },
        { headers: { Authorization: `${cookies.jwt}` } }
      );
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.id === msgId ? { ...msg, content: editedContent } : msg
        )
      );
      setEditedComment(null);
    } catch (e) {
      console.log("Error updating message:", e);
    }
  };

  const fetchMessages = async (chatId) => {
    if (!chatId) return;

    try {
      const response = await axios.get(`http://localhost:3000/chats/${chatId}/messages`, {
        headers: { Authorization: `${cookies.jwt}` },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    const decodedToken = jwtDecode(cookies.jwt);
    const senderId = decodedToken.sub;
    setUserId(senderId);

    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/users/${senderId}`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        setCurrentUser(response.data);
      } catch (e) {
        console.log("Error fetching current user", e);
      }
    };

    const fetchPeople = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users', {
          headers: { Authorization: `${cookies.jwt}` },
        });
        setAllPeople(response.data);
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };

    const fetchChatPeople = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/chats/chatted_people`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        setChatPeople(response.data);
      } catch (e) {
        console.log(`Error fetching chat people: ${e}`);
      }
    };

    if (cookies.jwt) {
      fetchPeople();
      fetchChatPeople();
      fetchCurrentUser();
    }
  }, [cookies.jwt]);

  useEffect(() => {
    if (chatId) {
      fetchMessages(chatId);
    }
  }, [chatId]);

  const handleSelectPerson = async (person) => {
    setSelectedChat(person);
    setSearchTerm('');
    setFilteredPeople([]);

    const decodedToken = jwtDecode(cookies.jwt);
    const senderId = decodedToken.sub;

    try {
      const response = await axios.post(
        "http://localhost:3000/chats",
        { sender_id: senderId, receiver_id: person.id },
        { headers: { Authorization: `${cookies.jwt}` } }
      );
      setChatId(response.data.id);

      if (!chatPeople.some(p => p.id === person.id)) {
        setChatPeople(prev => [...prev, person]);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  useEffect(() => {
    if (!chatId) return;

    const cable = getCable(cookies.jwt);
    const channel = cable.subscriptions.create(
      { channel: "ChatChannel", chat_id: chatId },
      {
        connected() {
          console.log("Connected to chatChannel for chat:", chatId);
        },
        disconnected() {
          console.log("Disconnected from chatChannel");
        },
        received: (message) => {
          setMessages(prev => {
            const messageExists = prev.some(msg => msg.id === message.chat.id);
            if (!messageExists) {
              return [...prev, message.chat];
            }
            return prev;
          });
        },
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [cookies.jwt, chatId]);

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredPeople([]);
      return;
    }

    const filtered = allPeople.filter(
      person =>
        person.name?.toLowerCase().includes(term.toLowerCase()) ||
        person.username?.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredPeople(filtered);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !chatId) return;

    try {
      const response = await axios.post(
        `http://localhost:3000/chats/${chatId}/messages`,
        { sender_id: userId, content: newMessage },
        { headers: { Authorization: `${cookies.jwt}` } }
      );
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatDate = (dateString) => {
    const messageDate = new Date(dateString);
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (messageDate.toDateString() === today) return "Today";
    if (messageDate.toDateString() === yesterday) return "Yesterday";

    return messageDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  let lastDate = null;

  return (
    <div className="h-140 flex bg-gray-50 font-sans">
      <div className="w-1/4 border-r border-gray-200 bg-white p-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search people..."
            className="w-full p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-md mt-1 max-h-48 overflow-y-auto z-10">
              {filteredPeople.length > 0 ? (
                filteredPeople.map(person => (
                  <div
                    key={person.id}
                    onClick={() => handleSelectPerson(person)}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center space-x-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{person.name}</p>
                      <p className="text-xs text-gray-500">@{person.email}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 p-2">No matches found</p>
              )}
            </div>
          )}
        </div>

        <div className="mt-2 overflow-y-auto h-120">
          {chatPeople.map(person => (
            <div
              key={person.id}
              className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${selectedChat?.id === person.id ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
              onClick={() => handleSelectPerson(person)}
            >
              <div className="flex-1">
                <p className="font-semibold text-gray-800">{person.name}</p>
                <p className="text-sm text-gray-500">@{person.email}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="w-3/4 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            <div className="p-6 border-b border-gray-200 bg-white">
              <h2 className="text-xl font-semibold text-gray-800">
                {selectedChat.name}
              </h2>
              <p className="text-sm text-gray-500">@{selectedChat.email}</p>
            </div>

            <div className="flex-grow p-6 overflow-y-auto">
              {messages.length > 0 ? (
                messages.map((msg, index) => {
                  const messageDate = formatDate(msg.created_at);
                  const showDate = messageDate !== lastDate;
                  lastDate = messageDate;

                  const isSender = msg.sender_id == userId;

                  return (
                    <div key={index}>
                      {showDate && <div className="text-center text-gray-500 text-xs font-bold my-4">{messageDate}</div>}

                      <div className={`mb-2 p-1 rounded ${selectedMessage === msg.id ? "bg-blue-50" : "hover:bg-gray-100"}`} onClick={(e) => handleSelectMessage(e, msg.id)}>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold">{isSender ? currentUser.name : selectedChat.name}</span>
                          <span className="text-[11px] text-gray-500">
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          {editedComment !== msg.id && isSender && selectedMessage === msg.id && (
                            <div className='relative'>
                              <MdMoreVert className='dots cursor-pointer' onClick={(e) => handleDropdown(e, msg.id)} />
                              {showDropdown === msg.id && (
                                <div className="absolute bg-white shadow-md rounded border mt-2 z-10">
                                  <button onClick={() => handleEditMessage(msg)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Edit
                                  </button>
                                  <button onClick={() => handleDeleteMessage(msg.id)} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {editedComment === msg.id ? (
                          <div className="flex flex-col space-y-2 max-w-72">
                            <input
                              type="text"
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="bg-white rounded-lg p-2"
                            />
                            <div className="flex justify-end space-x-2">
                              <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded-md text-sm" onClick={() => handleSaveEditedMessage(msg.id)}>Save</button>
                              <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded-md text-sm" onClick={() => setEditedComment(null)}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <div className="p-1 text-gray-800 inline-block">{msg.content}</div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center mt-10">No messages yet.</p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 border-t border-gray-200 bg-white">
              <div className="flex items-center space-x-4">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-grow p-3 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-all duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a chat to start messaging
          </div>
        )}
      </div>
    </div>
  );
};

export default People;