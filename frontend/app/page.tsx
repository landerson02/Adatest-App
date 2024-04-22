'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import { useState, useEffect, useContext } from "react";
import {generateTests, getPerturbations, getTests} from "@/lib/Service";
import {testType, testDataType, perturbedTestType} from "@/lib/Types";
import { TestDataContext } from "@/lib/TestContext";
import RadioButtons from "@/app/components/RadioButtons";
import NewButtons from "@/app/components/Buttons";

export default function Home() {

  // Whether tests are most recent
  const [isCurrent, setIsCurrent] = useState<boolean>(false);

  // Boolean for if the tests are being generated
  const [isGenerating, setIsGenerating] = useState(false);

  // Current topic filtered by: 'Acceptable', 'Unacceptable', '' - (default)
  const [filteredBy, setFilteredBy] = useState<string>('');

  // Boolean for if first checkbox is auto-selected
  const [isAutoCheck, setIsAutoSelect] = useState<boolean>(true);

  // Boolean for if perturbations are being generated
  const [isPerturbing, setIsPerturbing] = useState(false);

  // Load test decision context
  const {
    testData,
    setTestData,
    currentTopic,
  } = useContext(TestDataContext);

  /**
   * Toggle if a test is checked
   * @param t test to toggle
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

      // Fetch and process tests for the given topic
      async function fetchAndProcessTests(topic: string): Promise<testType[]> {
        let data: testType[] = await getTests(topic);

        if (data && data.length > 0) {
          data = data.reverse();
          data.forEach((test: testType) => { test.isChecked = false });
          data = data.filter((test: testType) => test.validity === 'Unapproved');
        }
        return data;
      }

      const topics = ['PE', 'KE', 'LCE'];
      let testArrays: { [key: string]: testType[] } = {};
      let perturbedTests : perturbedTestType[] = await getPerturbations();
      for (let type of topics) {
        testArrays[type] = await fetchAndProcessTests(type);
        testArrays[type].forEach((test: testType) => {
          test.perturbedTests = perturbedTests.filter((perturbedTest: perturbedTestType) => perturbedTest.test_parent === test.id);
        });
      }

      // curTests are the ones that are currently being displayed
      let curTests: testType[] = [...testArrays[currentTopic]];
      if (filteredBy !== '') {
        curTests = curTests.filter((test: testType) => test.label.toLowerCase() === filteredBy);
      }
      if (curTests.length > 0 && isAutoCheck) curTests[0].isChecked = true;

      let newTestData: testDataType = {
        tests: {
          PE: testArrays['PE'],
          KE: testArrays['KE'],
          LCE: testArrays['LCE'],
        },
        currentTests: curTests,
        decisions: testData.decisions,
      }
      setTestData(newTestData);
      setIsCurrent(true);
    }
    fetchTests();
  }, [isCurrent, currentTopic, filteredBy, isAutoCheck, isPerturbing]);

  /**
   * Update displayed tests when the topic changes
   */
  useEffect(() => {
    let newTestsData: testDataType = {
      tests: testData.tests,
      currentTests: testData.tests[currentTopic],
      decisions: testData.decisions,
    }
    setTestData(newTestsData);
  }, [currentTopic, isCurrent]);

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
          isPerturbing={isPerturbing}
          setIsPerturbing={setIsPerturbing}
        />
      </main>
    </div>
  );
}
