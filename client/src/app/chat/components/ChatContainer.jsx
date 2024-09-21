"use client";
import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import ChatInput from "./ChatInput";
import Logout from "./Logout";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { sendMessageRoute, recieveMessageRoute } from "../../utils/APIRoutes";
import SearchIcon from "@mui/icons-material/Search";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";

export default function ChatContainer({
  currentChat,
  socket,
  currentGroupChat,
}) {
  const [messages, setMessages] = useState([]);
  const [usersCache, setUsersCache] = useState({});
  const scrollRef = useRef();
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [userdata, setUserData] = useState(null);

  const fetchUsername = async (userId) => {
    // Check cache first
    if (usersCache[userId]) {
      return usersCache[userId];
    }

    try {
      const response = await axios.get(
        `http://localhost:5000/api/auth/getuser/${userId}`
      );
      const username = response.data.user.username;

      // Update cache
      setUsersCache((prevCache) => ({
        ...prevCache,
        [userId]: username,
      }));

      return username;
    } catch (error) {
      console.error("Error fetching username:", error);
      return "Unknown User";
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const data = await JSON.parse(
        localStorage.getItem(process.env.NEXT_PUBLIC_LOCALHOST_KEY)
      );
      setUserData(data);
      let response;
      if (!currentGroupChat) {
        response = await axios.post(recieveMessageRoute, {
          from: data._id,
          to: currentChat._id,
        });
      } else {
        response = await axios.post(
          "http://localhost:5000/api/groups/messages",
          {
            from: data._id,
            groupId: currentGroupChat._id,
          }
        );
      }

      console.log("check->", response.data);
      // Fetch usernames for all the messages
      const messagesWithUsernames = await Promise.all(
        response.data.map(async (message) => {
          const username = await fetchUsername(message.from);
          return { ...message, username };
        })
      );

      setMessages(messagesWithUsernames);
    };

    if (currentChat) fetchMessages();
  }, [currentChat, currentGroupChat]);

  useEffect(() => {
    // Listen for private message
    socket.current?.on("msg-recieve", (msg) => {
      setArrivalMessage({ fromSelf: false, message: msg });
    });

    // Listen for group message
    socket.current?.on("group-msg-recieve", (msg) => {
      setArrivalMessage({ fromSelf: false, message: msg });
    });
  }, [socket]);

  useEffect(() => {
    if (arrivalMessage) {
      setMessages((prev) => [...prev, arrivalMessage]);
    }
  }, [arrivalMessage]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMsg = async (msg) => {
    const data = JSON.parse(
      localStorage.getItem(process.env.NEXT_PUBLIC_LOCALHOST_KEY)
    );

    if (!currentGroupChat) {
      socket.current.emit("send-msg", {
        to: currentChat._id,
        from: data._id,
        msg,
      });
      await axios.post(sendMessageRoute, {
        from: data._id,
        to: currentChat._id,
        message: msg,
      });
    } else {
      socket.current.emit("send-group-msg", {
        groupId: currentGroupChat._id,
        from: data._id,
        msg,
      });
      await axios.post("http://localhost:5000/api/groups/addmessage", {
        from: data._id,
        groupId: currentGroupChat._id,
        message: msg,
      });
    }

    const newMessage = { fromSelf: true, message: msg };
    setMessages((prev) => [...prev, newMessage]);
  };

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
          </div>
        </div>
        <div className="icons">
          <VideocamOutlinedIcon />
          <SearchIcon />
        </div>
      </div>
      <div className="chat-messages">
        {messages.map((message) => (
          <div ref={scrollRef} key={uuidv4()}>
            <div
              className={`message ${message.fromSelf ? "sended" : "recieved"}`}
            >
              <div className="content">
                <p>{message.message}</p>
                <small>
                  {message.username === userdata.username
                    ? "You"
                    : message.username}
                </small>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #fff;
        small {
          font-size: 0.8rem; /* Smaller size for username */
          color: #aaa;
          display: block;
          margin-top: 0.5rem;
        }
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }

  .icons {
    display: flex;
    align-items: center;
    gap: 1rem; /* Space between icons */
    svg {
      color: white; /* Color for icons */
      cursor: pointer; /* Make icons clickable */
    }
  }
`;
