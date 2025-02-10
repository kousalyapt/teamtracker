import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";

const UserChat = () => {
  const { id } = useParams(); // Get the user ID from URL
  const [cookies] = useCookies(["jwt"]);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Fetch user details
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/users/${id}`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    // Fetch chat messages
    const fetchMessages = async () => {
      try {
        const response = await axios.get(`/chats/${id}`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        setMessages(response.data);
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchUser();
    fetchMessages();
  }, [id, cookies.jwt]);

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    try {
      const response = await axios.post(
        `/chats/${id}`,
        { content: message },
        { headers: { Authorization: `${cookies.jwt}` } }
      );

      setMessages((prev) => [...prev, response.data]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 bg-white shadow-md rounded-lg p-4">
      <h2 className="text-lg font-semibold">{user?.name || "Chat"}</h2>
      <div className="h-64 overflow-y-auto border p-3">
        {messages.map((msg, index) => (
          <div key={index} className={`p-2 ${msg.sender === "me" ? "text-right" : "text-left"}`}>
            <p className={`inline-block p-2 rounded-md ${msg.sender === "me" ? "bg-blue-500 text-white" : "bg-gray-200"}`}>
              {msg.content}
            </p>
          </div>
        ))}
      </div>
      <div className="flex mt-4">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-grow p-2 border rounded-l-md"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default UserChat;
