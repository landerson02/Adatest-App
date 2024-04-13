'use client'
import { testDataType, testType } from "@/lib/Types";
import Row from "@/app/components/Row";
import { RiFilterLine, RiFilterFill } from "react-icons/ri";
import { useEffect, useState, useContext } from "react";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { TestDataContext } from "@/lib/TestContext";

type testListProps = {
  groupByFunc: (groupBy: string) => void,
  grouping: string,
  toggleCheck: (test: testType) => void,
}

const TestList = ({
  groupByFunc,
  grouping,
  toggleCheck,
}: testListProps) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectedGrouping, setSelectedGrouping] = useState<string>('');
  const [groupedTests, setGroupedTests] = useState<testType[]>([]);
  const handleSelectChange = (newChoice: string) => {
    groupByFunc(newChoice);
    setSelectedGrouping(newChoice);
    setIsSelecting(false);
  }

  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  const { testData, setTestData, setCurrentTopic, currentTopic } = useContext(TestDataContext);

  useEffect(() => {
    setGroupedTests(testData.currentTests);
    groupTests(grouping);
  }, [selectedGrouping]);

  useEffect(() => {
    setIsAllSelected(testData.currentTests.length > 0 && testData.currentTests.every((test: testType) => test.isChecked));
  });

  function toggleSelectAll() {
    setIsAllSelected(!isAllSelected);
    if (!isAllSelected) {
      let newTests = testData.currentTests.map((test: testType) => {
        test.isChecked = true;
        return test;
      });
      let newTD: testDataType = {
        ...testData,
        currentTests: newTests
      }
      setTestData(newTD);
    } else {
      let newTD = testData;
      newTD.currentTests.forEach((test: testType) => {
        test.isChecked = false;
      })
      setTestData(newTD);
    }
  }

  const groupTests = (grouping: string) => {
    console.log(currentTopic);
    console.log(testData.currentTests);
    if (grouping === '') {
      setGroupedTests(testData.currentTests);
    } else if (grouping === 'acceptable') {
      setGroupedTests(testData.currentTests.filter((test: testType) => test.label.toLowerCase() === 'acceptable'));
    } else if (grouping === 'unacceptable') {
      setGroupedTests(testData.currentTests.filter((test: testType) => test.label.toLowerCase() === 'unacceptable'));
    } else {
      console.error('Invalid grouping: ' + grouping)
    }
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
            {grouping === '' ?
              <RiFilterLine className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelecting(!isSelecting)} /> :
              <RiFilterFill className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelecting(!isSelecting)} />
            }
            {isSelecting &&
              <div className="absolute z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-xl">
                <ul className="text-gray-700">
                  {grouping === '' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleSelectChange('')}>None
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleSelectChange('')}>None
                    </li>
                  }
                  {grouping === 'acceptable' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleSelectChange('acceptable')}>Acceptable
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleSelectChange('acceptable')}>Acceptable
                    </li>
                  }
                  {grouping === 'unacceptable' ?
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
      {selectedGrouping === '' ?
        testData && testData.currentTests.map((test: testType, index: number) => {
          return <Row key={index} test={test} setCurrentTopic={setCurrentTopic} currentTopic={currentTopic} toggleCheck={toggleCheck} />
        }) :
        groupedTests && groupedTests.map((test: testType, index: number) => {
          return <Row key={index} test={test} setCurrentTopic={setCurrentTopic} currentTopic={currentTopic} toggleCheck={toggleCheck} />
        })
      }
    </div>
  );
}

export default TestList;
