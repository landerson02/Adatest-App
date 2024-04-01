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


  function onGroupBy(groupBy: string) {
    setGroupedBy(groupBy);
  }

  // Toggle if a test is included in checkedTests
  function toggleCheck(test: testType) {
    let oldtests = checkedTests;
    oldtests.push(test);
    setCheckedTests(oldtests);
  }


  return (
    <TestDecisionsProvider>
      <div className={'grid grid-cols-4 gap-2'}>
        <div className={'col-span-1 p-4 h-screen justify-between w-full border-gray-500 border'}>
          <Options onGroupByFunc={onGroupBy} />
          <TaskGraph />
        </div>
        <main className="col-span-3 p-4 flex w-full h-screen flex-col items-center">
          <div className={'w-full h-16 flex justify-between gap-2 items-center text-3xl py-3 font-light'}>
            Topic:
            <div className={'flex w-[75%] justify-start'}>
              <span className={'text-black'}> <RadioButtons t={displayedTopic} setT={setDisplayedTopic} /> </span>
            </div>
            <div className={'w-[25%] flex justify-end'}>
              {isSubmitting ?
                <div className={'text-yellow-600'}>Generating...</div>
                : <SubmitButton onClickFunc={onSubmitTests} />
              }
            </div>
          </div>
          <TestList
            tests={currentTests}
            groupByFunc={onGroupBy}
            grouping={groupedBy}
            setCurrentTopic={setDisplayedTopic}
            currentTopic={displayedTopic}
            toggleCheck={toggleCheck}
          />
        </main>
      </div>
    </TestDecisionsProvider>
  );
}
