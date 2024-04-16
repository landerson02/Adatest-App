'use client'
import { testDataType, testType } from "@/lib/Types";
import Row from "@/app/components/Row";
import { RiFilterLine, RiFilterFill } from "react-icons/ri";
import { useEffect, useState, useContext } from "react";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { TestDataContext } from "@/lib/TestContext";

type testListProps = {
  setFilteredBy: (groupBy: string) => void,
  filteredBy: string,
  toggleCheck: (test: testType) => void,
  isCurrent: boolean,
}

const TestList = ({ setFilteredBy, filteredBy, toggleCheck, isCurrent }: testListProps) => {

  // Filtering states
  const [isSelectingFilter, setIsSelectingFilter] = useState<boolean>(false);

  /**
   * Handle change of new filtering
   * @param newChoice new choice to filter by
   */
  const handleSelectChange = (newChoice: string) => {
    setFilteredBy(newChoice);
    setIsSelectingFilter(false);
  }

  // Boolean for select all checkbox
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  // Load in test data
  const { testData, setTestData, setCurrentTopic, currentTopic } = useContext(TestDataContext);

  // Update current tests when the grouping changes
  useEffect(() => {
    filterTests(filteredBy);
  }, [filteredBy, isCurrent]);

  useEffect(() => {
    setIsAllSelected(testData.currentTests.length > 0 && testData.currentTests.every((test: testType) => test.isChecked));
  });

  function toggleSelectAll() {
    setIsAllSelected(!isAllSelected);
    if (!isAllSelected) {
      let newTests = [...testData.currentTests].map((test: testType) => {
        test.isChecked = true;
        return test;
      });
      let newTD: testDataType = {
        ...testData,
        currentTests: newTests
      }
      setTestData(newTD);
    } else {
      let newTD: testDataType = { ...testData };
      newTD.currentTests.forEach((test: testType) => {
        test.isChecked = false;
      });
      setTestData(newTD);
    }
  }

  const filterTests = (grouping: string) => {

    let newTests;
    if (grouping === '') {
      newTests = [...testData.tests[currentTopic]];
    } else {
      newTests = [...testData.tests[currentTopic]].filter((test: testType) => test.label.toLowerCase() === grouping);
    }
    let newTD: testDataType = {
      ...testData,
      currentTests: newTests
    }
    setTestData(newTD);
  }

  return (
    <div className={'w-full h-screen flex flex-col gap-2 overflow-y-scroll overflow-x-hidden'}>
      {/* HEADER */}
      <div className={'sticky top-0 border-black border-b w-full px-4 max-h-12 min-h-12 items-center flex justify-between bg-gray-200'}>
        <div className={'flex flex-row items-center w-32 hover:cursor-pointer'} onClick={toggleSelectAll}>
          {isAllSelected ? (
            <MdOutlineCheckBox className="w-6 h-6" />
          ) : (
            <MdOutlineCheckBoxOutlineBlank className="w-6 h-6" />
          )}
          Select All
        </div>
        <div className={'text-2xl text-center w-32'}>Essays</div>
        <div className={'ml-auto flex w-[25%] justify-center items-center pr-2'}>
          <div className={'text-2xl whitespace-nowrap'}>AI Grade</div>
          <div>
            {filteredBy === '' ?
              <RiFilterLine className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingFilter(!isSelectingFilter)} /> :
              <RiFilterFill className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingFilter(!isSelectingFilter)} />
            }
            {isSelectingFilter &&
              <div className="absolute z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-xl">
                <ul className="text-gray-700">
                  {filteredBy === '' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleSelectChange('')}>None
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleSelectChange('')}>None
                    </li>
                  }
                  {filteredBy === 'acceptable' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleSelectChange('acceptable')}>Acceptable
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleSelectChange('acceptable')}>Acceptable
                    </li>
                  }
                  {filteredBy === 'unacceptable' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleSelectChange('unacceptable')}>Unacceptable
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleSelectChange('unacceptable')}>Unacceptable
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
          {/* TODO: Capability */}

          {/*<div className={'text-xl w-[47%] flex justify-between'}> */}
          {/*<div>Capability</div> */}
          {/*</div> */}
        </div>
      </div>
      {/*{selectedGrouping === '' ?*/}
      {/*  testData && testData.currentTests.map((test: testType, index: number) => {*/}
      {/*    return <Row key={index} test={test} setCurrentTopic={setCurrentTopic} currentTopic={currentTopic} toggleCheck={toggleCheck} />*/}
      {/*  }) :*/}
      {/*  groupedTests && groupedTests.map((test: testType, index: number) => {*/}
      {/*    return <Row key={index} test={test} setCurrentTopic={setCurrentTopic} currentTopic={currentTopic} toggleCheck={toggleCheck} />*/}
      {/*  })*/}
      {/*}*/}
      {testData && testData.currentTests.map((test: testType, index: number) => {
        return <Row key={index} test={test} setCurrentTopic={setCurrentTopic} currentTopic={currentTopic} toggleCheck={toggleCheck} />
      })}
    </div>
  );
}

export default TestList;
