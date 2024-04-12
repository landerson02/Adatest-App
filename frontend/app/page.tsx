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

  // list of tests grouped by topic
  // const [testsPE, setTestsPE] = useState<testType[]>([]);
  // const [testsKE, setTestsKE] = useState<testType[]>([]);
  // const [testsLCE, setTestsLCE] = useState<testType[]>([]);
  // Current tests being displayed
  // const [currentTests, setCurrentTests] = useState<testType[]>([]);


  // Whether tests are most recent
  const [isCurrent, setIsCurrent] = useState<boolean>(false);

  // Current grouped tests
  const [filteredBy, setFilteredBy] = useState<string>('');


  // Tests with check box clicked
  // const [checkedTests, setCheckedTests] = useState<testType[]>([]);
  // const [checkedTestsSet, setCheckedTestsSet] = useState<Set<testType>>(new Set<testType>());

  // If all tests are selected boolean
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  /*
    * Toggle if all tests are selected
   */
  function toggleSelectAll() {
    setIsAllSelected(!isAllSelected);
    if (!isAllSelected) {
      // setCheckedTestsSet(new Set(currentTests));
      let newTD = testData;
      newTD.currentTests.forEach((test: testType) => {
        test.isChecked = true;
      })
      setTestData(newTD);
    } else {
      let newTD = testData;
      newTD.currentTests.forEach((test: testType) => {
        test.isChecked = false;
      })
      setTestData(newTD);
    }
  }

  // Update checked tests when set is changed
  // useEffect(() => {
  //   let newTests = Array.from(checkedTestsSet);
  //   setCheckedTests(newTests);
  // }, [checkedTestsSet]);



  /**
   * Toggle if a test is checked
   * @param test test to toggle
   */
  function toggleCheck(test: testType) {
    let newTD = testData;
    newTD.currentTests.forEach((t: testType) => {
      if (t.id === test.id) {
        t.isChecked = !t.isChecked;
      }
    });
    setTestData(newTD);
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
      let PEdata = await getTests('PE');
      PEdata = PEdata.reverse();
      PEdata.forEach((test: testType) => { test.isChecked = false });
      PEdata.filter((test: testType) => test.validity === 'Unapproved');
      // setTestsPE(PEdata);
      let KEdata = await getTests('KE');
      KEdata = KEdata.reverse();
      KEdata.forEach((test: testType) => { test.isChecked = false });
      KEdata.filter((test: testType) => test.validity === 'Unapproved');
      // setTestsKE(KEdata);
      let LCEdata = await getTests('LCE');
      LCEdata = LCEdata.reverse();
      LCEdata.forEach((test: testType) => { test.isChecked = false });
      LCEdata.filter((test: testType) => test.validity === 'Unapproved');
      // setTestsLCE(LCEdata);
      let newTestData: testDataType = {
        tests: {
          PE: PEdata,
          KE: KEdata,
          LCE: LCEdata,
        },
        currentTests: testData.currentTests,
        decisions: testData.decisions,
      }
      setTestData(newTestData);


      setIsCurrent(true);
    }
    fetchTests();
  }, [isCurrent]);

  // Update current tests state based on topic
  // useEffect(() => {
  //   if (displayedTopic === 'PE') {
  //     setCurrentTests(testsPE);
  //   } else if (displayedTopic === 'KE') {
  //     setCurrentTests(testsKE);
  //   } else if (displayedTopic === 'LCE') {
  //     setCurrentTests(testsLCE);
  //   }
  // }, [currentTopic, isCurrent, displayedTopic]);
  //
  useEffect(() => {
    changeCurrentTests(currentTopic);
  }, [currentTopic, isCurrent]);

  function changeCurrentTests(topic: string) {
    console.log('changing to: ' + topic);
    if (topic === 'PE') {
      // setCurrentTests(testData.tests.PE);
      let newTestData: testDataType = {
        tests: {
          PE: testData.tests.PE,
          KE: testData.tests.KE,
          LCE: testData.tests.LCE,
        },
        currentTests: testData.tests.PE,
        decisions: testData.decisions,
      }
      setTestData(newTestData);
    } else if (topic === 'KE') {
      // setCurrentTests(testData.tests.KE);
      let newTestData: testDataType = {
        tests: {
          PE: testData.tests.PE,
          KE: testData.tests.KE,
          LCE: testData.tests.LCE,
        },
        currentTests: testData.tests.KE,
        decisions: testData.decisions,
      }
      setTestData(newTestData);
    } else if (topic === 'LCE') {
      // setCurrentTests(testData.tests.LCE);
      let newTestData: testDataType = {
        tests: {
          PE: testData.tests.PE,
          KE: testData.tests.KE,
          LCE: testData.tests.LCE,
        },
        currentTests: testData.tests.LCE,
        decisions: testData.decisions,
      }
      setTestData(newTestData);
    }
  }


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

            <button className='absolute top-0 right-0' onClick={() => { console.log(testData) }}>print</button>


          </div>

        </div>
        <TestList
          groupByFunc={onFilter}
          grouping={filteredBy}
          toggleCheck={toggleCheck}
          toggleSelectAll={toggleSelectAll}
          isAllSelected={isAllSelected}
        />
        <NewButtons
          currentTopic={currentTopic}
          setCurrentTopic={setCurrentTopic}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          genTests={onGenerateTests}
          setIsCurrent={setIsCurrent}
        />
      </main>
    </div >
  );
}
