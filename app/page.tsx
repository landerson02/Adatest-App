'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import { useState, useEffect } from "react";
import {generateTests, getTests} from "@/lib/Service";
import {testType} from "@/lib/Types";
import GenerateButton from "@/app/components/GenerateButton";
import {TestContextProvider} from "@/lib/TestContext";

export default function Home() {
  const [tests, setTests] = useState<testType[]>([]);
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Load in new tests when they are changed
  useEffect(() => {
    async function fetchTests() {
      const data: testType[] = await getTests();
      console.log(data);
      setTests(data);
      setIsCurrent(true);
    }
    console.log('loading tests');
    fetchTests();
  }, [isCurrent]);

  // useEffect(() => {
  //   // generate tests
  //   async function fetchTests() {
  //     const data: testType[] = await generateTests();
  //     console.log(data);
  //     setTests(data);
  //     console.log(123);
  //     setIsCurrent(true);
  //   }
  //   fetchTests();
  // }, []);

  async function onGenerate() {
    setIsGenerating(true);
    await generateTests();
    setIsCurrent(false);
    setIsGenerating(false);
  }


  return (
    <TestContextProvider>
      <main className="flex h-screen flex-col items-center p-8">
        <div className={'flex justify-between w-full h-60 border-gray-500 border-2'}>
          <TaskGraph />
          <Options />
        </div>
        {isGenerating ?
          <div className={'text-yellow-600'}>Generating...</div>
          : <GenerateButton onClickFunc={onGenerate}/>
        }
        {/*<GenerateButton onClickFunc={onGenerate}/>*/}
        <TestList tests={tests} />
      </main>
    </TestContextProvider>
  );
}
