'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import { useState, useEffect } from "react";
import {generateTests, getTests} from "@/lib/Service";
import {testType} from "@/lib/Types";
import GenerateButton from "@/app/components/GenerateButton";
import {TestContextProvider} from "@/lib/TestContext";
import localFont from "next/dist/compiled/@next/font/dist/local";

export default function Home() {
  const [tests, setTests] = useState<testType[]>([]);
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [groupedBy, setGroupedBy] = useState<string>('');
  const [groupedTests, setGroupedTests] = useState<testType[]>([]);

  // Load in new tests when they are changed
  useEffect(() => {
    async function fetchTests() {
      const data: testType[] = await getTests();
      // console.log(data);
      setTests(data);
      setIsCurrent(true);
    }
    fetchTests();
  }, [isCurrent]);


  // Function for when the generate button is clicked
  async function onGenerate() {
    setIsGenerating(true);
    await generateTests();
    setIsCurrent(false);
    setIsGenerating(false);
  }

  useEffect(() => {
    let oldTests = tests;
    // Filter tests based on how they are grouped
    if(groupedBy == 'suggestion') {
      oldTests.filter((test) => test.topic == '/__suggestions__');
    } else if(groupedBy == 'acceptable') {
      oldTests.filter((test) => test.label == 'acceptable' || test.label == 'Acceptable');
    } else if(groupedBy == 'unacceptable') {
      oldTests.filter((test) => test.label == 'unacceptable' || test.label == 'Unacceptable');
    }
    setGroupedTests(oldTests);
  }, [groupedBy]);

  function onGroupBy(groupBy: string) {
    setGroupedBy(groupBy)
  }


  return (
    <TestContextProvider>
      <main className="flex h-screen flex-col items-center p-8">
        <div className={'flex justify-between w-full h-60 border-gray-500 border-2'}>
          <TaskGraph />
          <Options onGroupByFunc={onGroupBy}/>
        </div>
        {isGenerating ?
          <div className={'text-yellow-600'}>Generating...</div>
          : <GenerateButton onClickFunc={onGenerate}/>
        }
        {/*<GenerateButton onClickFunc={onGenerate}/>*/}
        {groupedBy === '' ? <TestList tests={tests}/> : <TestList tests={groupedTests}/>}
        {/*<TestList tests={tests} />*/}
      </main>
    </TestContextProvider>
  );
}
