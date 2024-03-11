'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import {useState, useEffect, useContext} from "react";
import {approveTest, clearTests, generateTests, getTests, approveTests, denyTests, trashTest} from "@/lib/Service";
import {testType} from "@/lib/Types";
import GenerateButton from "@/app/components/GenerateButton";
import {TestDecisionsProvider, TestDecisionsContext} from "@/lib/TestContext";
import RadioButtons from "@/app/components/RadioButtons";

export default function Home() {
  const [tests, setTests] = useState<testType[]>([]);

  // list of tests grouped by topic
  const [testsPE, setTestsPE] = useState<testType[]>([]);
  const [testsKE, setTestsKE] = useState<testType[]>([]);
  const [testsLCE, setTestsLCE] = useState<testType[]>([]);

  // Whether tests are most recent
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Current grouped tests
  const [groupedBy, setGroupedBy] = useState<string>('');

  // Submitting tests to backend
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load test decision context
  const {
    testDecisions,
    setTestDecisions,
    currentTopic,
    setCurrentTopic
  } = useContext(TestDecisionsContext);

  // Load in new tests when they are changed
  useEffect(() => {
    console.log('loading tests');
    async function fetchTests() {
      // TODO: Fix to load in tests based on topic
      // const data: testType[] = await getTests();
      if(currentTopic === 'PE') {
        const data = await getTests('PE');
        setTestsPE(data);
      } else if(currentTopic === 'KE') {
        const data = await getTests('KE');
        setTestsKE(data);
      } else if(currentTopic === 'LCE') {
        const data = await getTests('LCE');
        setTestsLCE(data);
      } else {
        console.error('No topic selected');
      }
      console.log('pe:');
      console.log(testsPE);
      console.log('ke:');
      console.log(testsKE);
      console.log('lce:');
      console.log(testsLCE);

      // console.log(data);
      // setTests(data);
      setIsCurrent(true);
    }
    fetchTests();
  }, [isCurrent, currentTopic]);


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
    // TODO: Fix submitting tests?

    await approveTests(tests);
    await denyTests(tests);
    // await trashTests(tests);

    console.log('submitting');
    // approveTests()
  }

  // useEffect(() => {
  //   let oldTests = tests;
  //   // Filter tests based on how they are grouped
  //   if(groupedBy == 'acceptable') {
  //     oldTests = oldTests.filter((test) => test.label == 'acceptable' || test.label == 'Acceptable');
  //   } else if(groupedBy == 'unacceptable') {
  //     oldTests = oldTests.filter((test) => test.label == 'unacceptable' || test.label == 'Unacceptable');
  //   }
  //   setGroupedTests(oldTests);
  //
  //   if(currentTopic === 'PE') {
  //     let oldTests = testsPE;
  //     if(groupedBy == 'acceptable') {
  //       oldTests = oldTests.filter((test) => test.label == 'acceptable' || test.label == 'Acceptable');
  //     } else if(groupedBy == 'unacceptable') {
  //       oldTests = oldTests.filter((test) => test.label == 'unacceptable' || test.label == 'Unacceptable');
  //     }
  //     setTestsPE(oldTests);
  //   }
  //   console.log(groupedTests);
  // }, [groupedBy]);

  function onGroupBy(groupBy: string) {
    setGroupedBy(groupBy);
  }

  const handleTopicChange = (topic: string) => {
    setCurrentTopic(topic);
  };

  return (
      <TestDecisionsProvider>
        <div className={'grid grid-cols-4 gap-2'}>
          <div className={'col-span-1 p-4 h-screen justify-between w-full border-gray-500 border-2'}>
            <Options onGroupByFunc={onGroupBy} />
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
            <div className={'w-full h-16 flex justify-center gap-2 items-center text-3xl py-3 font-light'}>
              Current Topic:
              <span className={'text-black'}> <RadioButtons> </RadioButtons></span>
            </div>
            {/*<GenerateButton onClickFunc={onGenerate}/>*/}
            {/*{groupedBy === '' ? <TestList tests={tests}/> : <TestList tests={groupedTests}/>}*/}
            {currentTopic === 'PE' ? <TestList tests={testsPE} groupByFunc={onGroupBy} grouping={groupedBy}/> : null}
            {currentTopic === 'KE' ? <TestList tests={testsKE} groupByFunc={onGroupBy} grouping={groupedBy}/> : null}
            {currentTopic === 'LCE' ? <TestList tests={testsLCE} groupByFunc={onGroupBy} grouping={groupedBy}/> : null}
            {/*<TestList tests={tests} />*/}
          </main>
        </div>
      </TestDecisionsProvider>
  );
}
