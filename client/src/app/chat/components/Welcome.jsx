"use client"; 

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Image from "next/image";
import Robot from "../../assets/robot.gif";

export default function Welcome() {
  const [userName, setUserName] = useState("");

  // Refactor useEffect to handle async correctly
  useEffect(() => {
    const fetchUserName = async () => {
      const data = await JSON.parse(localStorage.getItem(process.env.NEXT_PUBLIC_LOCALHOST_KEY));
            if (data) {
        setUserName(data.username);
      }
    };

    fetchUserName();
  }, []);

  return (
    <Container>
      <Image src={Robot} alt="Robot" width={300} height={300} />
      <h1>
        Welcome, <span>{userName}!</span>
      </h1>
      <h3>Please select a chat to start messaging.</h3>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  flex-direction: column;
  img {
    height: 20rem;
  }
  span {
    color: #4e0eff;
  }
`;
