'use client'

import TestList from "@/app/components/TestList";
import TaskGraph from "@/app/components/TaskGraph";
import { useState, useEffect, useContext } from "react";
import { generateTests, getPerturbations, getTests } from "@/lib/Service";
import { testType, testDataType, perturbedTestType } from "@/lib/Types";
import { TestDataContext } from "@/lib/TestContext";
import RadioButtons from "@/app/components/RadioButtons";
import Buttons from "@/app/components/Buttons";

export default function Home() {

  // Whether tests are most recent
  const [isCurrent, setIsCurrent] = useState<boolean>(false);
  const [criteriaLabels, setCriteriaLabels] = useState<string[]>(['Base', 'Spelling',
    'Synonyms', 'Paraphrase', 'Acronyms', 'Antonyms', 'Spanish']);
  // Boolean for if the tests are being generated
  const [isGenerating, setIsGenerating] = useState(false);
  // Boolean for if perturbations are being generated
  const [isPerturbing, setIsPerturbing] = useState(false);
  // Boolean for if tests have been perturbed
  const [isPerturbed, setIsPerturbed] = useState<boolean>(false);


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
  } = useContext(TestDataContext);

  useEffect(() => {
    async function fetchCriteriaLabels() {
      let perts = await getPerturbations();
      let labels: string[] = [];
      perts.forEach((pert: perturbedTestType) => {
          if (!labels.includes(pert.type)) {
          labels.push(pert.type);
          }
      });
      setCriteriaLabels(labels);
    }
    fetchCriteriaLabels()
  }, [isCurrent, isPerturbed]);
  /**
   * Use effect to toggle whether there have been any perturbations
   */
  useEffect(() => {
    if (testData.pert_decisions.approved.length > 0 || testData.pert_decisions.denied.length > 0) {
      setIsPerturbed(true);
    } else {
      setIsPerturbed(false);
    }
  }, [testData]);

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
      test_decisions: testData.test_decisions,
      pert_decisions: testData.pert_decisions,
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
          data = data.filter((test: testType) => test.validity != 'Invalid');
          data.sort((a, b) => {
            if (a.validity == "Unapproved" && b.validity != "Unapproved") {
              return -1; // Move a to the back
            } else if (a.validity != "Unapproved" && b.validity == "Unapproved") {
              return 1; // Move b to the back
            } else {
              return 0; // Preserve the order
            }
          });
        }
        return data;
      }

      const topics = ['PE', 'KE', 'LCE', 'CU0', 'CU5'];
      let testArrays: { [key: string]: testType[] } = {};

      // Get all perturbed tests
      let perturbedTests: perturbedTestType[] = await getPerturbations();
      console.log(perturbedTests)
      // Filter out invalid perturbations
      perturbedTests = perturbedTests.filter((perturbedTest: perturbedTestType) => perturbedTest.validity != 'Invalid');
      // Assign perturbed tests to their parent tests
      for (let type of topics) {
        testArrays[type] = await fetchAndProcessTests(type);
        testArrays[type].forEach((test: testType) => {
          test.perturbedTests = perturbedTests.filter((perturbedTest: perturbedTestType) => perturbedTest.test_parent === test.id);

          // Filter perts
          if (filterMap.pert !== '') {
            test.perturbedTests = test.perturbedTests.filter((pt: perturbedTestType) => pt.type.toLowerCase() === filterMap['pert'].toLowerCase());
          }

          // Filter by label
          if (filterMap.label !== '') {
            test.perturbedTests = test.perturbedTests.filter((pt: perturbedTestType) => pt.label.toLowerCase() === filterMap['label'].toLowerCase());
          }
        });
      }

      // curTests are the ones that are currently being displayed
      let curTests: testType[] = [...testArrays[currentTopic]];

      // Filter tests

      // By label
      if (filterMap['label'] !== '') {
        curTests = curTests.filter((test: testType) => test.perturbedTests.length != 0 || test.label.toLowerCase() === filterMap['label']);
      }

      // By user decision
      if (filterMap['grade'] !== '') {
        let filtering: string = '';
        if (filterMap['grade'] === 'Agreed') {
          filtering = 'approved';
        } else if (filterMap['grade'] === 'Disagreed') {
          filtering = 'denied';
        } else if (filterMap['grade'] === 'Ungraded') {
          filtering = 'unapproved';
        } else {
          console.error('Invalid grade filter');
          filtering = '';
        }
        curTests = curTests.filter((test: testType) => test.validity.toLowerCase() === filtering);
      }

      if (curTests.length > 0 && isAutoCheck) curTests[0].isChecked = true;

      const newTestDecisions = testData.test_decisions;
      const newPertDecisions = testData.pert_decisions;

      for (const key1 in newTestDecisions) {
        for (const key2 in newTestDecisions[key1]) {
          newTestDecisions[key1][key2] = []; // Set the array to an empty array
        }
      }
      for (const key1 in newPertDecisions) {
        newPertDecisions[key1] = []; // Set the array to an empty array
      }

      for (const topic of topics) {
        for (const test of testArrays[topic]) {
          if (test.validity == 'Unapproved') continue;
          newTestDecisions[topic][test.validity.toLowerCase()].push(test);
          for (const perturbedTest of test.perturbedTests) {
            if (perturbedTest.validity == 'Unapproved') continue;
            newPertDecisions[perturbedTest.validity.toLowerCase()].push(perturbedTest);
          }
        }
      }

      let newTestData: testDataType = {
        tests: {
          PE: testArrays['PE'],
          KE: testArrays['KE'],
          LCE: testArrays['LCE'],
          CU0: testArrays['CU0'],
          CU5: testArrays['CU5'],
        },
        currentTests: curTests,
        test_decisions: newTestDecisions,
        pert_decisions: newPertDecisions,
      }
      setTestData(newTestData);
      setIsCurrent(true);
    }
    fetchTests().catch();
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
        <TaskGraph isPerturbed={isPerturbed} criteriaLabels={criteriaLabels}/>
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
          toggleCheck={toggleCheck}
          setIsCurrent={setIsCurrent}
          filterMap={filterMap}
          setFilterMap={setFilterMap}
          isPerturbed={isPerturbed}
        />
        <Buttons
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
