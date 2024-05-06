'use client'
import { testDataType, testType } from "@/lib/Types";
import Row from "@/app/components/Row";
import { RiFilterLine, RiFilterFill } from "react-icons/ri";
import { useEffect, useState, useContext } from "react";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { TestDataContext } from "@/lib/TestContext";
import { logAction } from "@/lib/Service";

type testListProps = {
  toggleCheck: (test: testType) => void,
  setIsCurrent: (isCurrent: boolean) => void,
  filterMap: { [key: string]: string },
  setFilterMap: (filterMap: { [key: string]: string }) => void,
  isPerturbed: boolean,
}

const TestList = ({ toggleCheck, setIsCurrent, filterMap, setFilterMap, isPerturbed }: testListProps) => {

  // Filtering states
  const [isSelectingGradeFilter, setIsSelectingGradeFilter] = useState<boolean>(false);
  const [isSelectingDecisionFilter, setIsSelectingDecisionFilter] = useState<boolean>(false);
  const [isSelectingPertFilter, setIsSelectingPertFilter] = useState<boolean>(false);



  /**
   * Handle the change of a filter
   * @param newFiltering the new filter ((un)acceptable, (dis)agreed, pert type, etc.)
   * @param filterType the type of filter (label, grade, pert)
   */
  const handleFilterChange = (newFiltering: string, filterType: string) => {
    let newMap = { ...filterMap };
    newMap[filterType] = newFiltering;
    setFilterMap(newMap);
    setIsSelectingPertFilter(false);
    setIsSelectingDecisionFilter(false);
    setIsSelectingGradeFilter(false);
  }


  // Boolean for select all checkbox
  const [isAllSelected, setIsAllSelected] = useState<boolean>(false);

  // Load in test data
  const { testData, setTestData } = useContext(TestDataContext);


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


  return (
    <div className={'w-full h-screen flex flex-col overflow-y-scroll overflow-x-hidden'}>
      {/* HEADER */}
      <div className={'sticky top-0 border-black border-y border-gray-400 w-full max-h-12 min-h-12 items-center flex justify-between bg-gray-200 shadow'}>
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
            {filterMap['label'] === '' ?
              <RiFilterLine className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingGradeFilter(!isSelectingGradeFilter)} /> :
              <RiFilterFill className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingGradeFilter(!isSelectingGradeFilter)} />
            }
            {isSelectingGradeFilter &&
              <div className="absolute z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-xl">
                <ul className="text-gray-700">
                  {filterMap['label'] === '' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleFilterChange('', 'label')}>None
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleFilterChange('', 'label')}>None
                    </li>
                  }
                  {filterMap['label'] === 'acceptable' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleFilterChange('acceptable', 'label')}>Acceptable
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleFilterChange('acceptable', 'label')}>Acceptable
                    </li>
                  }
                  {filterMap['label'] === 'unacceptable' ?
                    <li className="cursor-pointer py-1 px-3 bg-gray-100"
                      onClick={() => handleFilterChange('unacceptable', 'label')}>Unacceptable
                    </li> :
                    <li className="cursor-pointer py-1 px-3 hover:bg-gray-100"
                      onClick={() => handleFilterChange('unacceptable', 'label')}>Unacceptable
                    </li>
                  }
                </ul>
              </div>
            }
          </div>
        </div>
        <div className={'flex w-[17%] justify-center items-center pr-2'}>
          <div className={'text-xl whitespace-nowrap'}>Decision</div>
          <div>
            {filterMap['grade'] === '' ?
              <RiFilterLine className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingDecisionFilter(!isSelectingDecisionFilter)} /> :
              <RiFilterFill className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingDecisionFilter(!isSelectingDecisionFilter)} />
            }
            {isSelectingDecisionFilter &&
              <div className="absolute z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-xl">
                <ul className="text-gray-700">
                  {['', 'Agreed', 'Disagreed', 'Ungraded'].map((type) => {
                    return (
                      <li
                        className={`cursor-pointer py-1 px-3 ${type.toLowerCase() === filterMap['grade'].toLowerCase() ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                        onClick={() => handleFilterChange(type, 'grade')}
                      >{type === '' ? 'None' : type}
                      </li>
                    )
                  })}
                </ul>
              </div>
            }
          </div>
        </div>
        {isPerturbed &&
          <div className={'w-[10%] flex justify-center items-center'}>
            <div className={'text-center whitespace-nowrap font-light'}>Criteria</div>

            {filterMap['pert'] === '' ?
              <RiFilterLine className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingPertFilter(!isSelectingPertFilter)} /> :
              <RiFilterFill className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingPertFilter(!isSelectingPertFilter)} />
            }
            {isSelectingPertFilter &&
              <div className="absolute top-10 z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-xl">
                <ul className="text-gray-700">
                  {['', 'Spelling', 'Negation', 'Synonyms', 'Paraphrase', 'Acronyms', 'Antonyms', 'Spanish'].map((type) => {
                    return (
                      <li
                        className={`cursor-pointer py-1 px-3 ${type.toLowerCase() === filterMap['pert'].toLowerCase() ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                        onClick={() => handleFilterChange(type, 'pert')}
                      >{type === '' ? 'None' : type}</li>
                    )
                  })}
                </ul>
              </div>
            }
          </div>
        }
      </div>

      {(testData && testData.currentTests.length > 0) ? (
        testData.currentTests.map((test: testType, index: number) => {
          return <Row key={index} test={test} toggleCheck={toggleCheck} setIsCurrent={setIsCurrent}
                      isPertsFiltered={filterMap['pert'] !== ''}  isPerturbed={isPerturbed}/>
        })
      ) : (filterMap['label'] !== '') ? (
        <div className={'text-2xl text-center text-gray-500 pt-8'}>
          There are no '{filterMap['label']}' essays to show. <br />Either generate more essays or select a different filter.
        </div>
      ) : (
        <div className={'text-2xl text-center text-gray-500 pt-8'}>
          Please Select 'Generate More Statements' to Continue
        </div>
      )}
    </div>
  );
}

export default TestList;
