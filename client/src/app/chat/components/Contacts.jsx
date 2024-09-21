"use client";

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image"; // Next.js built-in image component
import { useRouter } from "next/navigation";
import Logo from "../../assets/logo.svg";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Select, MenuItem, Avatar } from '@mui/material';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Logout from "./Logout";


export default function Contacts({ contacts, changeChat,groups,setGroups }) {
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserImage, setCurrentUserImage] = useState(undefined);
  const [currentSelected, setCurrentSelected] = useState(undefined);
  const [OpenCreateGroup, setOpenCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const router = useRouter();
  console.log(contacts);

  useEffect(()=>{
    try{
      const fetchAllUsers = async () => {
        const { data } = await axios.get("http://localhost:5000/api/auth/allusers/66eabb8949a154a542327716");
        setAllUsers(data);
        console.log("jsjaajaa",data);
      };
      fetchAllUsers();
    }
    catch(error){
      console.log(error);
    }
  },[]);

  useEffect(() => {
    const fetchUserData = async () => {
      const data = await JSON.parse(localStorage.getItem(process.env.NEXT_PUBLIC_LOCALHOST_KEY));
      if (data) {
        setCurrentUserName(data.username);
        setCurrentUserImage(data.avatarImage);
      } else {
        router.push("/login");
      }
    };

    fetchUserData();
  }, [router]);

  const changeCurrentChat = (index, contact) => {
    setCurrentSelected(index);
    changeChat(contact);
  };

  const handleOpenCreateGroup = () => {
    setOpenCreateGroup(true);
  };

  const handleCloseCreateGroup = () => {
    setOpenCreateGroup(false);
  };

  const handleSelectMembers = (event) => {
    setSelectedMembers(event.target.value);
  };

    
  const handleCreateGroup =async () => {
    console.log("createGroup");
    setOpenCreateGroup(false);
    const data = {
      name: groupName,
      users: selectedMembers
    };
    console.log(data);
    try{
      const response = await axios.post("http://localhost:5000/api/groups/create", data);
    console.log(response);
      toast.success("Group created successfully");
    const res = await axios.get(`http://localhost:5000/api/groups/allgroups`);
        
    setGroups(res.data);
    setGroupName('');
    setSelectedMembers([]);
    }
    catch(error){
      console.log(error);
      toast.error("Failed to create group");
    }
  };

  return (
    <>
      {currentUserImage && currentUserName && (
        <Container>
          <div className="brand">
            <div className="flex">
              <Image src={Logo} alt="logo" width={50} height={50} />
              <h3>snappy</h3>
            </div>
            <button onClick={handleOpenCreateGroup}>+</button>

            <Dialog open={OpenCreateGroup} onClose={handleCloseCreateGroup}>
        <DialogTitle>Create a Group Chat</DialogTitle>
        <DialogContent>
          <TextField
            label="Group Name"
            fullWidth
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            margin="normal"
          />
          <Select
            multiple
            value={selectedMembers}
            onChange={handleSelectMembers}
            displayEmpty
            fullWidth
            renderValue={(selected) => (selected.length === 0 ? 'Select members' : selected.join(', '))}
          >
            {allUsers.map((user) => (
              <MenuItem key={user._id} value={user._id}>
                {user.username}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateGroup}>Cancel</Button>
          <Button onClick={handleCreateGroup} color="primary">Create</Button>
        </DialogActions>
      </Dialog>

          </div>
          <div className="h-[300px] overflow-y-scroll flex-col gap-4 justify-between align-middle">
          <div className="contacts mb-4">
            {groups.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    {contact.avatarImage ? (
                      <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt="avatar"
                    />
                    ) : (
                      <Avatar>{contact.name.charAt(0)}</Avatar>
                    )
                    }
                  </div>
                  <div className="username">
                    <h3>{contact.name}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="contacts">
            {contacts.map((contact, index) => {
              return (
                <div
                  key={contact._id}
                  className={`contact ${
                    index === currentSelected ? "selected" : ""
                  }`}
                  onClick={() => changeCurrentChat(index, contact)}
                >
                  <div className="avatar">
                    <img
                      src={`data:image/svg+xml;base64,${contact.avatarImage}`}
                      alt="avatar"
                    />
                  </div>
                  <div className="username">
                    <h3>{contact.username}</h3>
                  </div>
                </div>
              );
            })}
          </div>
          </div>
          <div className="current-user">
            <div className="avatar">
              <img
                src={`data:image/svg+xml;base64,${currentUserImage}`}
                alt="avatar"
              />
            </div>
            <div className="username flex gap-2 align-middle justify-center">
              <h2>{currentUserName}</h2>
              <Logout />
            </div>
          </div>
          <ToastContainer />
        </Container>
      )}
    </>
  );
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 75% 15%;
  overflow: hidden;
  background-color: #080420;
  .brand {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: space-between;
    img {
      height: 2rem;
    }
    h3 {
      color: white;
      text-transform: uppercase;
    }
    button {
      background-color: #4e0eff;
      border: none;
      color: white;
      font-size: 1.5rem;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
    }
  }
  .contacts {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow-y: scroll;
    gap: 0.8rem;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .contact {
      background-color: #ffffff34;
      min-height: 5rem;
      cursor: pointer;
      width: 90%;
      border-radius: 0.2rem;
      padding: 0.4rem;
      display: flex;
      gap: 1rem;
      align-items: center;
      transition: 0.5s ease-in-out;
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
    .selected {
      background-color: #9a86f3;
    }
  }
  .current-user {
    background-color: #0d0d30;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 2rem;
    .avatar {
      img {
        height: 4rem;
        max-inline-size: 100%;
      }
    }
    .username {
      h2 {
        color: white;
      }
    }
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      gap: 0.5rem;
      .username {
        h2 {
          font-size: 1rem;
        }
      }
    }
  }
`;
