'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import { useState, useEffect } from "react";
import {generateTests, getTests} from "@/lib/Service";
import {testType} from "@/lib/Types";
import GenerateButton from "@/app/components/GenerateButton";
import {log} from "node:util";

export default function Home() {
  const [tests, setTests] = useState<testType[]>([]);

  useEffect(() => {
    // fetch('api/react')
    //   .then(response => response.json())
    //   .then(data => {
    //     console.log(data);
    //     setTests(data);
    //   })

    async function fetchTests() {
      const data: testType[] = await getTests();
      console.log(data);
      setTests(data);
    }
    fetchTests();
  }, []);

  return (
    <main className="flex h-screen flex-col items-center p-8">
      <div className={'flex justify-between w-full h-60 border-gray-500 border-2'}>
        <TaskGraph />
        <Options />
      </div>
      <GenerateButton onClickFunc={generateTests}/>
      <TestList tests={tests}/>
    </main>
  );
}
