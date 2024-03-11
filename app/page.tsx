'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import {useState, useEffect, useContext} from "react";
import {generateTests, getTests, approveTests, denyTests, trashTests} from "@/lib/Service";
import {testType} from "@/lib/Types";
import GenerateButton from "@/app/components/GenerateButton";
import {TestDecisionsProvider, TestDecisionsContext} from "@/lib/TestContext";
import RadioButtons from "@/app/components/RadioButtons";
import SubmitButton from "@/app/components/SubmitButton";

export default function Home() {
  const [tests, setTests] = useState<testType[]>([]);

  // list of tests grouped by topic
  const [testsPE, setTestsPE] = useState<testType[]>([]);
  const [testsKE, setTestsKE] = useState<testType[]>([]);
  const [testsLCE, setTestsLCE] = useState<testType[]>([]);
  const [currentTests, setCurrentTests] = useState<testType[]>([]);
  const [displayedTopic, setDisplayedTopic] = useState<string>('PE');

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
      // if(currentTopic === 'PE') {
      //   const data = await getTests('PE');
      //   setTestsPE(data);
      // } else if(currentTopic === 'KE') {
      //   const data = await getTests('KE');
      //   setTestsKE(data);
      // } else if(currentTopic === 'LCE') {
      //   const data = await getTests('LCE');
      //   setTestsLCE(data);
      // } else {
      //   console.error('No topic selected');
      // }

      // Load in all tests
      const PEdata = await getTests('PE');
      setTestsPE(PEdata);
      const KEdata = await getTests('KE');
      setTestsKE(KEdata);
      const LCEdata = await getTests('LCE');
      setTestsLCE(LCEdata);

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
  }, [isCurrent]);

  useEffect(() => {
    if(displayedTopic === 'PE') {
      setCurrentTests(testsPE);
    } else if(displayedTopic === 'KE') {
      setCurrentTests(testsKE);
    } else if(displayedTopic === 'LCE') {
      setCurrentTests(testsLCE);
    }
    console.log(currentTests);
    console.log(123);
    console.log(currentTopic);
  }, [currentTopic, isCurrent, displayedTopic]);

  useEffect(() => {
    console.log('current topic: ' + currentTopic);
  }, [currentTopic]);


  // Function for when the generate button is clicked
  async function onGenerate() {
    setIsGenerating(true);
    await generateTests(currentTopic);
    setIsCurrent(false);
    setIsGenerating(false);
  }

  async function onClear() {
    // await clearTests();
    setIsCurrent(false);
  }

  async function onSubmitTests() {
    setIsSubmitting(true);
    // TODO: Fix submitting tests?

    const at = await approveTests(tests, displayedTopic);
    await denyTests(tests, displayedTopic);
    await trashTests(tests, displayedTopic);

    await generateTests(displayedTopic);

    console.log('submitting');
    setIsSubmitting(false);
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
          <div className={'col-span-1 p-4 h-screen justify-between w-full border-gray-500 border'}>
            <Options onGroupByFunc={onGroupBy} />
            <TaskGraph/>
          </div>
          <main className="col-span-3 p-4 flex w-full h-screen flex-col items-center">
            <div className={'w-full h-16 flex justify-between gap-2 items-center text-3xl py-3 font-light'}>
              Topic:
              <div className={'flex w-[75%] justify-start'}>
                <span className={'text-black'}> <RadioButtons t={displayedTopic} setT={setDisplayedTopic}/> </span>
              </div>
              <div className={'w-[25%] flex justify-end'}>
                {isSubmitting ?
                  <div className={'text-yellow-600'}>Generating...</div>
                  : <SubmitButton onClickFunc={onSubmitTests}/>
                }
              </div>
            </div>
            {/*<GenerateButton onClickFunc={onGenerate}/>*/}
            {/*{groupedBy === '' ? <TestList tests={tests}/> : <TestList tests={groupedTests}/>}*/}
            {/*{currentTopic === 'PE' ? <TestList tests={testsPE} groupByFunc={onGroupBy} grouping={groupedBy}/> : null}*/}
            {/*{currentTopic === 'KE' ? <TestList tests={testsKE} groupByFunc={onGroupBy} grouping={groupedBy}/> : null}*/}
            {/*{currentTopic === 'LCE' ? <TestList tests={testsLCE} groupByFunc={onGroupBy} grouping={groupedBy}/> : null}*/}
            <TestList tests={currentTests} groupByFunc={onGroupBy} grouping={groupedBy} setCurrentTopic={setDisplayedTopic} currentTopic={displayedTopic}/>
            {/*<TestList tests={tests} />*/}
          </main>
        </div>
      </TestDecisionsProvider>
  );
}
