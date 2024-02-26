'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import { useState, useEffect } from "react";

export default function Home() {
  const [tests, setTests] = useState([]);

  useEffect(() => {
    fetch('api/react')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setTests(data);
      })
  }, []);

  return (
    <main className="flex h-screen flex-col items-center p-8">
      <div className={'flex justify-between w-full h-60 border-gray-500 border-2'}>
        <TaskGraph />
        <Options />
      </div>
      <TestList tests={tests}/>
    </main>
  );
}
