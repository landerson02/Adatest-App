'use client'
import {testType} from "@/lib/Types";
import Row from "@/app/components/Row";
import { RiFilterLine, RiFilterFill } from "react-icons/ri";
import {useEffect, useState} from "react";

type testListProps = {
  tests: testType[],
  groupByFunc: (groupBy: string) => void,
  grouping: string,
}

const TestList = ({ tests, groupByFunc, grouping } : testListProps) => {
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [selectedGrouping, setSelectedGrouping] = useState<string>('');
  const [groupedTests, setGroupedTests] = useState<testType[]>([]);
  const handleSelectChange = (newChoice: string) => {
    groupByFunc(newChoice);
    setSelectedGrouping(newChoice);
    setIsSelecting(false);
  }

  useEffect(() => {
    setGroupedTests(tests);
    groupTests(grouping);
  }, [selectedGrouping]);

  const groupTests = (grouping: string) => {
    if(grouping === '') {
      setGroupedTests(tests);
    } else if(grouping === 'acceptable') {
      setGroupedTests(tests.filter((test: testType) => test.label === 'acceptable'));
    } else if(grouping === 'unacceptable') {
      setGroupedTests(tests.filter((test: testType) => test.label === 'unacceptable'));
    } else {
      console.error('Invalid grouping: ' + grouping)
    }
  }
  return (
    <div className={'w-full h-screen flex flex-col gap-2 overflow-y-scroll'}>
        <div className={'sticky top-0 border-black border-b w-full max-h-12 min-h-12 items-center flex justify-between bg-gray-200'}>
          <div className={'text-xl w-[60%] text-center'}>AI Generated Test</div>
          <div className={'ml-auto flex w-[40%] justify-between pr-2'}>
            <div className={'w-[50%] flex justify-center items-center'}>
              <div className={'text-xl'}>AI Grade</div>
              <div>
                {grouping === '' ?
                  <RiFilterLine className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelecting(!isSelecting)}/> :
                  <RiFilterFill className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelecting(!isSelecting)}/>
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
            </div>
            <div className={'text-xl w-[47%] flex justify-between'}>
              <p>Approve</p>
              <p>Deny</p>
              <p>Trash</p>
            </div>
          </div>
        </div>
      {selectedGrouping === '' ?
        tests && tests.map((test: testType, index: number) => {
          return <Row key={index} test={test}/>
        }) :
        groupedTests && groupedTests.map((test: testType, index: number) => {
          return <Row key={index} test={test}/>
        })
      }
    </div>
  );
}

export default TestList;
