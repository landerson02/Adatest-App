'use client'
import { testDataType, testType } from "@/lib/Types";
import Row from "@/app/components/Row";
import { RiFilterLine, RiFilterFill } from "react-icons/ri";
import { useEffect, useState, useContext } from "react";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { TestDataContext } from "@/lib/TestContext";
import { logAction } from "@/lib/Service";

type testListProps = {
  setFilteredBy: (groupBy: string) => void,
  filteredBy: string,
  toggleCheck: (test: testType) => void,
  isCurrent: boolean,
  setIsCurrent: (isCurrent: boolean) => void,
}

const TestList = ({ setFilteredBy, filteredBy, toggleCheck, isCurrent, setIsCurrent }: testListProps) => {

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
      logAction(["null"], "Toggle Select All On");
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
      logAction(["null"], "Toggle Select All Off");
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
      logAction(["null"], `Filter by ${grouping}`);
    }
    let newTD: testDataType = {
      ...testData,
      currentTests: newTests
    }
    setTestData(newTD);
  }

  return (
    <div className={'w-full h-screen flex flex-col overflow-y-scroll overflow-x-hidden'}>
      {/* HEADER */}
      <div className={'sticky top-0 border-black border-b w-full max-h-12 min-h-12 items-center flex justify-between bg-gray-200'}>
        <div className={'flex flex-row items-center justify-center w-[5%] hover:cursor-pointer'} onClick={toggleSelectAll}>
          {isAllSelected ? (
            <MdOutlineCheckBox className="w-6 h-6" />
          ) : (
            <MdOutlineCheckBoxOutlineBlank className="w-6 h-6" />
          )}
          {/*Select All*/}
        </div>
        <div className={'text-xl text-center w-[55%]'}>Statements</div>
        <div className={'flex w-[17%] justify-center items-center pr-2'}>
          <div className={'text-xl whitespace-nowrap'}>AI Grade</div>
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
        </div>
        <div className={"flex w-[13%] justify-center items-center pr-2"}>
          <div className={"text-xl whitespace-nowrap"}>
            Your Grade
          </div>
        </div>
        <div className={'w-[10%] text-center font-light'}>Criteria</div>
      </div>

      {(testData && testData.currentTests.length > 0) ? (
        testData.currentTests.map((test: testType, index: number) => {
          return <Row key={index} test={test} toggleCheck={toggleCheck} setIsCurrent={setIsCurrent} />
        })
      ) : (filteredBy !== '') ? (
        <div className={'text-2xl text-center text-gray-500 pt-8'}>
          There are no '{filteredBy}' essays to show. <br />Either generate more essays or select a different filter.
        </div>
      ) : (
        <div className={'text-2xl text-center text-gray-500 pt-8'}>
          Please Select 'Generate More Essays' to Continue
        </div>
      )}
    </div>
  );
}

export default TestList;
