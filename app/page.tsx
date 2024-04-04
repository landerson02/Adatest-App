'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import Options from "@/app/components/Options";
import { useState, useEffect, useContext } from "react";
import { generateTests, getTests, approveTests, denyTests, trashTests as trashTests } from "@/lib/Service";
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

  // boolean for if submitting tests to backend
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

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
    * @param test: testType
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
      // TODO: Fix to load in tests based on topic

      // Load in all tests and set them accordingly
      const PEdata = await getTests('PE');
      setTestsPE(PEdata);
      const KEdata = await getTests('KE');
      setTestsKE(KEdata);
      const LCEdata = await getTests('LCE');
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


  /**
   * Submit button handler
   */
  async function onSubmitTests() {
    if (isSubmitting) return;

    setIsSubmitting(true);

    // Approve/deny/trash current set of tests
    switch (displayedTopic) {
      case 'PE':
        await approveTests(testDecisions.PE.approved, displayedTopic);
        await denyTests(testDecisions.PE.denied, displayedTopic);
        await trashTests(testDecisions.PE.trashed, displayedTopic);
        break;
      case 'KE':
        await approveTests(testDecisions.KE.approved, displayedTopic);
        await denyTests(testDecisions.KE.denied, displayedTopic);
        await trashTests(testDecisions.KE.trashed, displayedTopic);
        break;
      case 'LCE':
        await approveTests(testDecisions.LCE.approved, displayedTopic);
        await denyTests(testDecisions.LCE.denied, displayedTopic);
        await trashTests(testDecisions.LCE.trashed, displayedTopic);
        break;
    }

    await generateTests(displayedTopic);
    setIsSubmitting(false);
    setIsCurrent(false);
  }

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
        <div className={'col-span-1 p-4 h-screen justify-between w-full border-gray-500 border'}>
          <Options onGroupByFunc={onGroupBy} />
          <TaskGraph />
        </div>
        <main className="col-span-3 flex w-full h-screen flex-col items-center">
          {/* HEADER */}
          <div className={'px-4 w-full h-16 flex justify-between gap-2 items-center text-3xl py-3 font-light'}>
            Topic:
            <div className={'flex w-[75%] justify-start'}>
              <span className={'text-black'}> <RadioButtons t={displayedTopic} setT={setDisplayedTopic} /> </span>
            </div>



            {/* TODO: Remove */}
            <button onClick={() => { console.log(checkedTests) }}>
              print
            </button>

          </div>
          <TestList
            tests={currentTests}
            groupByFunc={onGroupBy}
            grouping={groupedBy}
            setCurrentTopic={setDisplayedTopic}
            currentTopic={displayedTopic}
            toggleCheck={toggleCheck}
            toggleSelectAll={toggleSelectAll}
            isAllSelected={isAllSelected}
            checkedTestsSet={checkedTestsSet}
          />
          <NewButtons
            checkedTests={checkedTests}
            setCheckedTests={setCheckedTests}
            currentTopic={displayedTopic}
            setCurrentTopic={setDisplayedTopic}
          />
        </main>
      </div>
    </TestDecisionsProvider>
  );
}
