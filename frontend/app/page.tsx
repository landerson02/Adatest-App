'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import { useState, useEffect, useContext } from "react";
import { generateTests, getTests } from "@/lib/Service";
import { testType, testDataType } from "@/lib/Types";
import { TestDataContext } from "@/lib/TestContext";
import RadioButtons from "@/app/components/RadioButtons";
import NewButtons from "@/app/components/NewButtons";

export default function Home() {

  // Whether tests are most recent
  const [isCurrent, setIsCurrent] = useState<boolean>(false);

  // Current grouped tests
  const [filteredBy, setFilteredBy] = useState<string>('');


  /**
   * Toggle if a test is checked
   * @param test test to toggle
   */
  function toggleCheck(t: testType) {
    const updatedTests = testData.currentTests.map((test: testType) => {
      if (test.id === t.id) {
        return { ...test, isChecked: !test.isChecked };
      }
      return test;
    });

    // Create the new test data object
    let newData: testDataType = {
      tests: testData.tests,
      currentTests: updatedTests,
      decisions: testData.decisions,
    }

    setTestData(newData);
  }

  // Boolean for if the tests are being generated
  const [isGenerating, setIsGenerating] = useState(false);

  // Load test decision context
  const {
    testData,
    setTestData,
    currentTopic,
    setCurrentTopic,
  } = useContext(TestDataContext);

  /**
   * Load in new tests when they are changed
   */
  useEffect(() => {
    async function fetchTests() {
      // Load in all tests and set them accordingly
      let PEdata: testType[] = await getTests('PE');
      PEdata = PEdata.reverse();
      PEdata.forEach((test: testType) => { test.isChecked = false });
      PEdata = PEdata.filter((test: testType) => test.validity === 'Unapproved');

      let KEdata: testType[] = await getTests('KE');
      KEdata = KEdata.reverse();
      KEdata.forEach((test: testType) => { test.isChecked = false });
      KEdata = KEdata.filter((test: testType) => test.validity === 'Unapproved');

      let LCEdata: testType[] = await getTests('LCE');
      LCEdata = LCEdata.reverse();
      LCEdata.forEach((test: testType) => { test.isChecked = false });
      LCEdata = LCEdata.filter((test: testType) => test.validity === 'Unapproved');

      let newTestData: testDataType = {
        tests: {
          PE: PEdata,
          KE: KEdata,
          LCE: LCEdata,
        },
        currentTests: currentTopic === 'PE' ? PEdata : currentTopic === 'KE' ? KEdata : LCEdata,
        decisions: testData.decisions,
      }
      setTestData(newTestData);

      setIsCurrent(true);
    }
    fetchTests();
  }, [isCurrent]);

  useEffect(() => {
    changeCurrentTests();
  }, [currentTopic, isCurrent]);

  /**
   * Change the current tests to the current topic
  */
  function changeCurrentTests() {
    console.log(currentTopic);
    let newTestsData: testDataType = {
      tests: testData.tests,
      currentTests: testData.tests[currentTopic],
      decisions: testData.decisions,
    }
    setTestData(newTestsData);
  }

  /**
   * Generate tests for the current topic
   */
  async function onGenerateTests() {
    setIsGenerating(true);
    await generateTests(currentTopic);
    setIsGenerating(false);
    return;
  }

  function onFilter(filterBy: string) {
    setFilteredBy(filterBy);
  }


  return (
    <div className={'grid grid-cols-4'}>
      <div className={'col-span-1 p-4 h-screen flex flex-col justify-center w-full border-gray-500 border'}>
        {/* <Options onGroupByFunc={onGroupBy} /> */}
        <TaskGraph />
      </div >
      <main className="col-span-3 flex w-full h-screen flex-col items-center">
        {/* HEADER */}
        <div className={'px-4 w-full h-16 flex justify-between gap-2 items-center text-3xl py-3 font-light'}>
          Topic:
          <div className={'flex w-[75%] justify-start'}>
            <span className={'text-black'}>
              <RadioButtons
                currentTopic={currentTopic}
                setCurrentTopic={setCurrentTopic}
              />
            </span>

            <button className={'absolute top-0 right-0'} onClick={() => { console.log(testData) }}>print</button>
            <button className={'absolute top-10 right-0'} onClick={() => { console.log(testData.currentTests.filter(test => test.isChecked).length) }}>count</button>


          </div>

        </div>
        <TestList
          groupByFunc={onFilter}
          grouping={filteredBy}
          toggleCheck={toggleCheck}
        />
        <NewButtons
          currentTopic={currentTopic}
          setCurrentTopic={setCurrentTopic}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          genTests={onGenerateTests}
          isCurrent={isCurrent}
          setIsCurrent={setIsCurrent}
        />
      </main>
    </div >
  );
}
