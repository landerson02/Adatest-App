'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import { useState, useEffect, useContext } from "react";
import { generateTests, getTests, approveTests, denyTests, trashTests } from "@/lib/Service";
import { testType } from "@/lib/Types";
import { TestDecisionsProvider, TestDecisionsContext } from "@/lib/TestContext";
import RadioButtons from "@/app/components/RadioButtons";
import SubmitButton from "@/app/components/SubmitButton";
import NewButtons from "@/app/components/NewButtons";

export default function Home() {

  // list of tests grouped by topic
  const [testsPE, setTestsPE] = useState<testType[]>([]);
  const [testsKE, setTestsKE] = useState<testType[]>([]);
  const [testsLCE, setTestsLCE] = useState<testType[]>([]);
  // Current tests being displayed
  const [currentTests, setCurrentTests] = useState<testType[]>([]);

  const [displayedTopic, setDisplayedTopic] = useState<string>('PE');

  // Whether tests are most recent
  const [isCurrent, setIsCurrent] = useState<boolean>(false);

  // Current grouped tests
  const [groupedBy, setGroupedBy] = useState<string>('');


  // Tests with check box clicked
  const [checkedTests, setCheckedTests] = useState<testType[]>([]);
  const [checkedTestsSet, setCheckedTestsSet] = useState<Set<testType>>(new Set<testType>());

  // If all tests are selected boolean
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  /*
    * Toggle if all tests are selected
   */
  function toggleSelectAll() {
    setIsAllSelected(!isAllSelected);
    if (!isAllSelected) {
      setCheckedTestsSet(new Set(currentTests));
    } else {
      setCheckedTestsSet(new Set());
    }
  }

  // Update checked tests when set is changed
  useEffect(() => {
    let newTests = Array.from(checkedTestsSet);
    setCheckedTests(newTests);
  }, [checkedTestsSet]);



  /**
   * Toggle if a test is checked
   * @param test test to toggle
   */
  function toggleCheck(test: testType) {
    let oldTests = new Set(checkedTestsSet);
    if (oldTests.has(test)) {
      oldTests.delete(test);
    } else {
      oldTests.add(test);
    }
    setCheckedTestsSet(oldTests);
  }

  // Boolean for if the tests are being generated
  const [isGenerating, setIsGenerating] = useState(false);

  // Load test decision context
  const {
    testDecisions,
    currentTopic,
  } = useContext(TestDecisionsContext);

  // Load in new tests when they are changed
  useEffect(() => {
    async function fetchTests() {
      // Load in all tests and set them accordingly
      let PEdata = await getTests('PE');
      PEdata = PEdata.reverse();
      setTestsPE(PEdata);
      let KEdata = await getTests('KE');
      KEdata = KEdata.reverse();
      setTestsKE(KEdata);
      let LCEdata = await getTests('LCE');
      LCEdata = LCEdata.reverse();
      setTestsLCE(LCEdata);

      setIsCurrent(true);
    }
    fetchTests();
  }, [isCurrent]);

  // Update current tests state based on topic
  useEffect(() => {
    if (displayedTopic === 'PE') {
      setCurrentTests(testsPE);
    } else if (displayedTopic === 'KE') {
      setCurrentTests(testsKE);
    } else if (displayedTopic === 'LCE') {
      setCurrentTests(testsLCE);
    }
  }, [currentTopic, isCurrent, displayedTopic]);


  async function onGenerateTests() {
    setIsGenerating(true);
    await generateTests(displayedTopic);
    setIsGenerating(false);
    return;
  }


  function onGroupBy(groupBy: string) {
    setGroupedBy(groupBy);
  }


  return (
    <TestDecisionsProvider>
      <div className={'grid grid-cols-4'}>
        <div className={'col-span-1 p-4 h-screen justify-center w-full border-gray-500 border'}>
          {/* <Options onGroupByFunc={onGroupBy} /> */}
          <TaskGraph />
        </div>
        <main className="col-span-3 flex w-full h-screen flex-col items-center">
          {/* HEADER */}
          <div className={'px-4 w-full h-16 flex justify-between gap-2 items-center text-3xl py-3 font-light'}>
            Topic:
            <div className={'flex w-[75%] justify-start'}>
              <span className={'text-black'}> <RadioButtons setTopic={setDisplayedTopic} /> </span>
            </div>

          </div>
          <TestList
            tests={currentTests}
            groupByFunc={onGroupBy}
            grouping={groupedBy}
            currentTopic={displayedTopic}
            setCurrentTopic={setDisplayedTopic}
            toggleCheck={toggleCheck}
            toggleSelectAll={toggleSelectAll}
            isAllSelected={isAllSelected}
            checkedTestsSet={checkedTestsSet}
          />
          <NewButtons
            checkedTests={checkedTests}
            setCheckedTests={setCheckedTests}
            setCheckedTestsSet={setCheckedTestsSet}
            currentTopic={displayedTopic}
            setCurrentTopic={setDisplayedTopic}
            isGenerating={isGenerating}
            setIsGenerating={setIsGenerating}
            genTests={onGenerateTests}
            setIsCurrent={setIsCurrent}
          />
        </main>
      </div>
    </TestDecisionsProvider>
  );
}
