import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';

const People = () => {
  const [allPeople, setAllPeople] = useState([]); 
  const [chatPeople, setChatPeople] = useState([]); 
  const [filteredPeople, setFilteredPeople] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [cookies] = useCookies(['jwt']);
  const [chatId, setChatId] = useState()
  const [userId, setUserId] = useState()
  const [currentUser, setCurrentUser] = useState()
  const [otherUser, setOtherUser] = useState()
 

  
  useEffect(() => {
    const decodedToken = jwtDecode(cookies.jwt);
      const senderId = decodedToken.sub;
      setUserId(senderId)
      console.log("ui",userId)

    const fetchCurrentUser = async() => {
      try{
        const response = await axios.get(`http://localhost:3000/users/${senderId}`,
          {
            headers: {
              Authorization: `${cookies.jwt}` 
            }
          }
        )
        setCurrentUser(response.data)
      }catch(e){
        console.log("Error fetching currentuser",e)
      }
    }
    const fetchPeople = async () => {
      try {
        const response = await axios.get('http://localhost:3000/users', {
          headers: { Authorization: `${cookies.jwt}` },
        });
        if (response.data) {
          setAllPeople(response.data);
        }
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };



    const fetchChatPeople = async() => {
      try{
        const response = await axios.get(`http://localhost:3000/chats/chatted_people`,
          {
            headers: {
              Authorization: `${cookies.jwt}`
            }
          }
        )
        setChatPeople(response.data)
      }catch(e){
        console.log(`Error fetching chatpeople: ${e}`)
      }
    }

    if (cookies.jwt) {
      fetchPeople();
    
  fetchChatPeople();
  fetchCurrentUser();
}
  }, [cookies.jwt]);


  const handleSelectPerson = async (person) => {
    console.log("person",person)
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
  
      console.log("Chat created or retrieved:", response.data);
      setChatId(response.data.id)
      fetchMessages(response.data.id);

  
      if (!chatPeople.some((p) => p.id === person.id)) {
        setChatPeople((prev) => [...prev, person]);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };
  

 
  const fetchMessages = async (chatId) => {
    if (!chatId) return;
  
    try {
      console.log("Fetching messages for chatId:", chatId);
      const response = await axios.get(`http://localhost:3000/chats/${chatId}/messages`, {
        headers: { Authorization: `${cookies.jwt}` },
      });
  
      console.log("Fetched messages:", response.data);
      setMessages(response.data); 
      console.log("msges",messages)
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  
 
  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredPeople([]);
      return;
    }

    const filtered = allPeople.filter(
      (person) =>
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
  
      console.log("Sent message:", response.data);

      setMessages((prevMessages) => [...prevMessages, response.data]);
  
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  
  

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
                filteredPeople.map((person) => (
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
          {chatPeople.map((person) => (
            <div
              key={person.id}
              className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedChat?.id === person.id ? 'bg-blue-50' : 'hover:bg-gray-100'
              }`}
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
                messages.map((msg, index) => (
                  <div>
                    {console.log(`cu ${currentUser} sc ${selectedChat}`)}
                    <div>{msg.sender_id == userId ? currentUser.name : selectedChat.name}</div>
                  <div
                    key={index}
                    className={`p-3 my-2 max-w-xs rounded-lg ${
                      msg.sender_id == userId
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    
                    {msg.content}
                  </div>
                  <div>{console.log(`msgid ${msg.sender_id} usid ${userId}`)}</div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center mt-10">
                  No messages yet.
                </p>
              )}
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
