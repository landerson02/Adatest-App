'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import {useState, useEffect, useContext} from "react";
import {approveTest, clearTests, generateTests, getTests, approveTests} from "@/lib/Service";
import {testType} from "@/lib/Types";
import GenerateButton from "@/app/components/GenerateButton";
import {TestDecisionsProvider, TestDecisionsContext} from "@/lib/TestContext";

export default function Home() {
  const [tests, setTests] = useState<testType[]>([]);

  const [currentTopic, setCurrentTopic] = useState<string>('PE');

  const [testsPE, setTestsPE] = useState<testType[]>([]);
  const [testsKE, setTestsKE] = useState<testType[]>([]);
  const [testsLCE, setTestsLCE] = useState<testType[]>([]);

  const [isCurrent, setIsCurrent] = useState<boolean>(false); // Whether or not tests are most recent
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Current grouped tests
  const [groupedBy, setGroupedBy] = useState<string>('');
  const [groupedTests, setGroupedTests] = useState<testType[]>([]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load test decision context
  const testDecisions = useContext(TestDecisionsContext);

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

  async function onClear() {
    await clearTests();
    setIsCurrent(false);
  }

  async function onSubmitTests() {
    setIsSubmitting(false);
    console.log('submitting');
    // approveTests()
  }

  useEffect(() => {
    let oldTests = tests;
    // Filter tests based on how they are grouped
    if(groupedBy == 'acceptable') {
      oldTests = oldTests.filter((test) => test.label == 'acceptable' || test.label == 'Acceptable');
    } else if(groupedBy == 'unacceptable') {
      oldTests = oldTests.filter((test) => test.label == 'unacceptable' || test.label == 'Unacceptable');
    }
    setGroupedTests(oldTests);
    console.log(groupedTests);
  }, [groupedBy]);

  function onGroupBy(groupBy: string) {
    setGroupedBy(groupBy)
  }


  return (
      <TestDecisionsProvider>
        <div className={'grid grid-cols-4 gap-4'}>
          <div className={'col-span-1 p-4 h-screen justify-between w-full border-gray-500 border-2'}>
            <Options onGroupByFunc={onGroupBy}/>
            <TaskGraph/>
          </div>
          <main className="col-span-3 p-4 flex w-full h-screen flex-col items-center">
            <div className={'w-[30%] h-8 flex justify-between items-center'}>
              {isGenerating ?
                  <div className={'text-yellow-600'}>Generating...</div>
                  : <GenerateButton onClickFunc={onGenerate}/>
              }
              <button onClick={onClear} className={'w-24 h-8 bg-red-600 hover:bg-red-800'}>Clear</button>
            </div>
            {/*<GenerateButton onClickFunc={onGenerate}/>*/}
            {groupedBy === '' ? <TestList tests={tests}/> : <TestList tests={groupedTests}/>}
            {/*<TestList tests={tests} />*/}
          </main>
        </div>
      </TestDecisionsProvider>
  );
}
