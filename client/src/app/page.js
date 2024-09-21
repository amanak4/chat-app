"use client";
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkLoggedIn = async () => {
      const user = JSON.parse(localStorage.getItem(process.env.NEXT_PUBLIC_LOCALHOST_KEY));
      if (user) {
        router.push('/chat');
      }
      else {
        router.push('/login');
      }
    };

    checkLoggedIn();
  }, [router]);

  return (
    <div>
      {/* You can add any content or message for non-logged-in users here */}
      <p>Redirecting...</p>
    </div>
  );
}
