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

  // Boolean for if the tests are being generated
  const [isGenerating, setIsGenerating] = useState(false);

  // Current topic filtered by: 'Acceptable', 'Unacceptable', '' - (default)
  const [filteredBy, setFilteredBy] = useState<string>('');

  // Boolean for if first checkbox is auto-selected
  const [isAutoCheck, setIsAutoSelect] = useState<boolean>(true);


  // Load test decision context
  const {
    testData,
    setTestData,
    currentTopic,
  } = useContext(TestDataContext);

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

  /**
   * Load in new tests when they are changed
   */
  useEffect(() => {
    async function fetchTests() {
      // Load in all tests and set them accordingly
      let PEdata: testType[] = await getTests('PE');
      if (PEdata && PEdata.length > 0) {
        PEdata = PEdata.reverse();
        PEdata.forEach((test: testType) => { test.isChecked = false });
        PEdata = PEdata.filter((test: testType) => test.validity === 'Unapproved');
      }

      let KEdata: testType[] = await getTests('KE');
      if (KEdata && KEdata.length > 0) {
        KEdata = KEdata.reverse();
        KEdata.forEach((test: testType) => { test.isChecked = false });
        KEdata = KEdata.filter((test: testType) => test.validity === 'Unapproved');
      }

      let LCEdata: testType[] = await getTests('LCE');
      if (LCEdata && LCEdata.length > 0) {
        LCEdata = LCEdata.reverse();
        LCEdata.forEach((test: testType) => { test.isChecked = false });
        LCEdata = LCEdata.filter((test: testType) => test.validity === 'Unapproved');
      }

      let curTests: testType[] = currentTopic === 'PE' ? [...PEdata] : currentTopic === 'KE' ? [...KEdata] : [...LCEdata];
      if (filteredBy !== '') {
        curTests = curTests.filter((test: testType) => test.label.toLowerCase() === filteredBy);
      }
      if (curTests.length > 0 && isAutoCheck) curTests[0].isChecked = true;

      let newTestData: testDataType = {
        tests: {
          PE: PEdata,
          KE: KEdata,
          LCE: LCEdata,
        },
        currentTests: curTests,
        decisions: testData.decisions,
      }
      setTestData(newTestData);

      setIsCurrent(true);
    }
    fetchTests();
  }, [isCurrent, currentTopic, filteredBy, isAutoCheck]);

  /**
   * Update displayed tests
   */
  useEffect(() => {
    changeCurrentTests();
  }, [currentTopic, isCurrent]);

  /**
   * Change the current tests to the current topic
  */
  function changeCurrentTests() {
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

  return (
    <div className={'grid grid-cols-4'}>
      <div className={'col-span-1 p-4 h-screen justify-center w-full border-gray-500 border'}>
        {/* <Options onGroupByFunc={onGroupBy} /> */}
        <TaskGraph />
      </div >
      <main className="col-span-3 flex w-full h-screen flex-col items-center">
        {/* HEADER */}
        <div className={'px-4 w-full h-16 flex gap-2 items-center py-3'}>
          <span className={'text-3xl font-light'}>Topic:</span>
          <RadioButtons
            isAutoCheck={isAutoCheck}
            setIsAutoCheck={setIsAutoSelect}
            setIsCurrent={setIsCurrent}
          />
        </div>
        <TestList
          setFilteredBy={setFilteredBy}
          filteredBy={filteredBy}
          toggleCheck={toggleCheck}
          isCurrent={isCurrent}
        />
        <NewButtons
          currentTopic={currentTopic}
          isGenerating={isGenerating}
          genTests={onGenerateTests}
          setIsCurrent={setIsCurrent}
        />
      </main>
    </div>
  );
}
