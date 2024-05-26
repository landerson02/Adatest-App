'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import { useState, useEffect, useContext } from "react";
import { generateTests, getPerturbations } from "@/lib/Service";
import { testDataType, perturbedTestType } from "@/lib/Types";
import { TestDataContext } from "@/lib/TestContext";
import RadioButtons from "@/app/components/RadioButtons";
import Buttons from "@/app/components/Buttons";
import { fetchTests } from "@/lib/utils";

export default function Home() {
  // Boolean for if the tests are being generated
  const [isGenerating, setIsGenerating] = useState(false);
  // Boolean for if perturbations are being generated
  const [isPerturbing, setIsPerturbing] = useState(false);

  // Map that contains all current filters ('' is no filter)
  // 'label' -> (un)acceptable
  // 'grade' -> (dis)agreed, ungraded
  // 'pert' -> type of perturbation
  const [filterMap, setFilterMap] = useState<{ [key: string]: string }>({
    'label': '',
    'grade': '',
    'pert': '',
  });

  // Boolean for if first checkbox is auto-selected
  const [isAutoCheck, setIsAutoSelect] = useState<boolean>(false);

  // Load test decision context
  const {
    testData,
    setTestData,
    currentTopic,
    isCurrent,
    setIsCurrent
  } = useContext(TestDataContext);

  /**
   * Load in new tests when they are changed
   */
  useEffect(() => {
    fetchTests(filterMap, currentTopic, isAutoCheck, testData, setTestData, setIsCurrent).catch();
  }, [isCurrent, currentTopic, filterMap, isAutoCheck, isPerturbing]);

  /**
   * Update displayed tests when the topic changes
   */
  useEffect(() => {
    let newTestsData: testDataType = {
      tests: testData.tests,
      currentTests: testData.tests[currentTopic],
      test_decisions: testData.test_decisions,
      pert_decisions: testData.pert_decisions,
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
        <TaskGraph/>
      </div >
      <main className="col-span-3 flex w-full h-screen flex-col items-center">
        {/* HEADER */}
        <div className={'px-4 w-full h-16 flex gap-2 items-center py-3'}>
          <span className={'text-3xl font-light'}>Topic:</span>
          <RadioButtons
            isAutoCheck={isAutoCheck}
            setIsAutoCheck={setIsAutoSelect}
          />
        </div>
        <TestList
          filterMap={filterMap}
          setFilterMap={setFilterMap}
        />
        <Buttons
          currentTopic={currentTopic}
          isGenerating={isGenerating}
          genTests={onGenerateTests}
          isPerturbing={isPerturbing}
          setIsPerturbing={setIsPerturbing}
        />
      </main>
    </div>
  );
}
