import { React, createContext, useState, useEffect } from 'react';
import { useCookies } from 'react-cookie';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { getCable } from '../cable';


const PeopleContext = createContext();

const PeopleContextProvider = ({ children }) => {
  const [allChats, setAllChats] = useState()
  const [chatPeople, setChatPeople] = useState([]);
  const [cookies] = useCookies(['jwt']);
  const [userId, setUserId] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);



  useEffect(() => {
    if (!cookies.jwt) {
      return;
    }
    const decodedToken = jwtDecode(cookies.jwt);
    const senderId = decodedToken.sub;
    setUserId(senderId);

    const fetchAllChats = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/chats`, {
          params: { user_id: senderId },
          headers: {
            Authorization: `${cookies.jwt}`
          }
        })
        console.log("allch", response.data)
        setAllChats(response.data)
      } catch (e) {
        console.log("error fetching all chat", e)
      }
    }


    const fetchChatPeople = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/chats/chatted_people`, {
          headers: { Authorization: `${cookies.jwt}` },
        });
        console.log("ctp", response.data)
        setChatPeople(response.data);
      } catch (e) {
        console.log(`Error fetching chat people: ${e}`);
      }
    };

    if (cookies.jwt) {
      fetchAllChats();

      fetchChatPeople();

    }
  }, [cookies.jwt]);

  useEffect(() => {
    console.log("lk", allChats)
    if (chatPeople && chatPeople.length > 0) {
      const totalUnread = chatPeople.reduce((acc, chat) => acc + (chat.unread_messages || 0), 0);
      console.log("totl", totalUnread)
      setUnreadCount(totalUnread);

    }
  }, [allChats]);

  useEffect(() => {
    console.log("All chats before subscribing:", allChats);
    if (!allChats || allChats.length === 0) {
      return;
    }

    const cable = getCable(cookies.jwt);
    console.log("Cable object:", cable);

    if (!cable) {
      console.error("Cable is not initialized");
      return;
    }

    const subscriptions = [];

    allChats.forEach(chat => {
      console.log("Subscribing to chat:", chat.id);

      const subscription = cable.subscriptions.create(

        { channel: 'ChatChannel', chat_id: chat.id },
        {
          connected() {
            console.log("Connected to chatChannel for chat:", chat.id);
          },
          disconnected() {
            console.log("Disconnected from chatChannel");
          },
          received: (data) => {
            console.log("Received message:", data);
            console.log("selectedchat", selectedChat);
            console.log("data.senderid", data.sender_id);
            console.log("userid", userId)

            if (data.action == "create") {



              if (selectedChat?.id === data.sender_id || data.sender_id == userId) {
                console.log("in")

                setMessages(prev => {
                  const messageExists = prev.some(msg => msg.id === data.message.id);
                  if (!messageExists) {
                    return [...prev, data.message];
                  }
                  return prev;
                });
                // setUnreadMessages(prev => ({
                //   ...prev,
                //   [data.chat_id]: (prev[data.chat_id] || 0) + 1
                // }));
              } else {
                console.log("hiu")
                console.log("chatpeople", chatPeople)
                console.log("datasenderid", data.sender_id)
                setChatPeople(prev =>
                  prev.map(person =>
                    person.id === data.sender_id
                      ? { ...person, unread_messages: (person.unread_messages || 0) + 1 }
                      : person
                  )
                );
                console.log("after", chatPeople)
                console.log("ct", unreadCount)

                setUnreadCount(prev => prev + 1);

              }
            }else if(data.action == "update"){
              console.log("updat",data)
              setMessages(prevMessages =>
                prevMessages.map(msg =>
                  msg.id === data.message.id ? { ...msg, content: data.content, updated_at: data.message.updated_at } : msg
                )
              );
            }else if(data.action == "delete"){
              console.log("Delet",data)
              if (selectedChat?.id === data.sender_id || data.sender_id == userId) {
                console.log("in")
                setMessages(prevMessages => prevMessages.filter(msg => msg.id !== data.message_id));

              } else {
                console.log("hiu")
                console.log("chatpeople", chatPeople)
                console.log("datasenderid", data.sender_id)
                setChatPeople(prev =>
                  prev.map(person =>
                    person.id === data.sender_id
                      ? { ...person, unread_messages: (person.unread_messages || 0) - 1 }
                      : person
                  )
                );
                console.log("after", chatPeople)
                console.log("ct", unreadCount)

                setUnreadCount(prev => prev - 1);

              }
            }
          }
        }
      );

      subscriptions.push(subscription);
    });

    return () => {
      console.log("Unsubscribing from channels...");
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [allChats, selectedChat, cookies.jwt]);

  return (
    <PeopleContext.Provider value={{ allChats, setAllChats, chatPeople, setChatPeople, userId, setUserId, selectedChat, setSelectedChat, messages, setMessages, unreadCount, setUnreadCount }}>
      {children}
    </PeopleContext.Provider>
  )
}

export { PeopleContext, PeopleContextProvider }