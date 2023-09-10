'use client';
import React from 'react';
import { useSession, signIn } from 'next-auth/react';

interface RoomProps {
  id: number;
}

const Room: React.FC<RoomProps> = ({ id }) => {
  const { data: session } = useSession();
  const roomName = `Room${id}`;
  const timeSlots: string[] = [];
  
  for (let i = 11; i <= 20; i++) {
    const time: string = `${i}:00_`;
    timeSlots.push(time);
  }

  const handleButtonClick = (time: string) => {
    if (session) {
      console.log(`${roomName} at ${time}`);
    } else {
      // If the user is not logged in, redirect them to the login page
      signIn();
    }
  };

  return (
    <div>
      <h2>{roomName}</h2>
      <div className="time-slots">
        {timeSlots.map((time, index) => (
          <button key={index} onClick={() => handleButtonClick(time)}>
            {time}
          </button>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div>
      <Room id={1} />
      <Room id={2} />
    </div>
  );
};

export default Dashboard;
