"use client";
import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import styled from "styled-components";
import { allUsersRoute, host } from "../utils/APIRoutes";
import ChatContainer from "./components/ChatContainer";
import Contacts from "./components/Contacts";
import Welcome from "./components/Welcome";

export default function Chat() {
  const router = useRouter();
  const socket = useRef();
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [currentGroupChat, setCurrentGroupChat] = useState(undefined);
  const [currentUser, setCurrentUser] = useState(undefined);

  useEffect(() => {
    const loadUser = async () => {
      const userData = localStorage.getItem(process.env.NEXT_PUBLIC_LOCALHOST_KEY);
      if (!userData) {
        router.push("/login");
      } else {
        setCurrentUser(JSON.parse(userData));
      }
    };
    loadUser();
  }, [router]);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);

      return () => socket.current.disconnect();
    }
  }, [currentUser]);

  useEffect(() => {
    const fetchContacts = async () => {
      if (currentUser?.isAvatarImageSet) {
        try {
          const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
        
          setContacts(data);
        } catch (error) {
          console.error("Failed to fetch contacts:", error);
        }
      } else {
        router.push("/setAvatar");
      }
    };

    if (currentUser) {
      fetchContacts();
    }
  }, [currentUser, router]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (currentUser?.isAvatarImageSet) {
        try {
          const { data } = await axios.get(`http://localhost:5000/api/groups/allgroups`);
        
          setGroups(data);
        } catch (error) {
          console.error("Failed to fetch groups:", error);
        }
      } else {
        router.push("/setAvatar");
      }
    };

    if (currentUser) {
      fetchGroups();
    }
  }, [currentUser, router]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
    // console.log("grpname->",chat.name);
     if(chat.name){
      setCurrentGroupChat(chat);
     }
     else{
      setCurrentGroupChat(undefined);
     }
  };

  return (
    <Container>
      <div className="container">
        <Contacts contacts={contacts} changeChat={handleChatChange} groups={groups} setGroups={setGroups} />
        {currentChat ? (
          <ChatContainer currentChat={currentChat} socket={socket} currentGroupChat={currentGroupChat} />
        ) : (
          <Welcome />
        )}
      </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #fff;
  
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #080420;
    display: grid;
    grid-template-columns: 25% 75%;
    padding-top: 2rem;
    padding-bottom: 1rem;
    padding-left: 1rem;

    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }

    @media screen and (max-width: 720px) {
      grid-template-columns: 0.75fr 1fr;
    }
  }
`;
