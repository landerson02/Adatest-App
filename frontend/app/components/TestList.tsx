'use client'
import { testDataType, testType } from "@/lib/Types";
import Row from "@/app/components/Row";
import { RiFilterLine, RiFilterFill } from "react-icons/ri";
import { useEffect, useState, useContext } from "react";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { TestDataContext } from "@/lib/TestContext";
import { getAllPerturbationTypes, logAction } from "@/lib/Service";
import { hasPerturbed } from "@/lib/utils";

type testListProps = {
  filterMap: { [key: string]: string },
  setFilterMap: (filterMap: { [key: string]: string }) => void,
}

const TestList = ({ filterMap, setFilterMap }: testListProps) => {

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
  const { testData, setTestData, isCurrent } = useContext(TestDataContext);

  useEffect(() => {
    setIsAllSelected(testData.currentTests?.length > 0 && testData.currentTests.every((test: testType) => test.isChecked));
  });

  const [pertList, setPertList] = useState<string[]>([]);
  useEffect(() => {
    async function getPerts() {
      const perts: string[] = await getAllPerturbationTypes();
      perts.unshift('');
      setPertList(perts);
    }
    getPerts().catch();
  }, [isCurrent]);

  function toggleSelectAll() {
    setIsAllSelected(!isAllSelected);
    if (!isAllSelected) {
      logAction(["null"], "Toggle Select All On").catch();
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
      logAction(["null"], "Toggle Select All Off").catch();
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
      <div className={'sticky top-0 border-y border-gray-400 w-full max-h-12 min-h-12 items-center flex justify-between bg-gray-200 shadow'}>
        <div className={'flex flex-row items-center justify-center w-[5%] hover:cursor-pointer'} onClick={toggleSelectAll}>
          {isAllSelected ? (
            <MdOutlineCheckBox className="w-6 h-6" />
          ) : (
            <MdOutlineCheckBoxOutlineBlank className="w-6 h-6" />
          )}
          {/*Select All*/}
        </div>
        <div className={`text-xl text-center ${hasPerturbed(testData) ? "w-[55%]" : "w-[65%]"}`}>Statements</div>
        <div className={'flex w-[17%] justify-center items-center pr-2'}>
          <div className={'text-xl whitespace-nowrap'}>AI Assessment</div>
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
        <div className={'flex w-[13%] justify-center items-center pr-2'}>
          <div className={'text-xl whitespace-nowrap'}>My Decision</div>
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
                      >{type === '' ? 'None' : type[0].toUpperCase() + type.slice(1).toLowerCase()}
                      </li>
                    )
                  })}
                </ul>
              </div>
            }
          </div>
        </div>
        {hasPerturbed(testData) &&
          <div className={'w-[10%] flex justify-center items-center'}>
            <div className={'text-center whitespace-nowrap font-light'}>Criteria</div>

            {filterMap['pert'] === '' ?
              <RiFilterLine className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingPertFilter(!isSelectingPertFilter)} /> :
              <RiFilterFill className={'h-6 w-6 text-black hover:scale-110'} onClick={() => setIsSelectingPertFilter(!isSelectingPertFilter)} />
            }
            {isSelectingPertFilter &&
              <div className="absolute top-10 z-10 mt-2 w-32 bg-white border border-gray-200 rounded shadow-xl">
                <ul className="text-gray-700">
                  {pertList.length !== 0 && pertList.map((type) => {
                    return (
                      <li
                        className={`cursor-pointer py-1 px-3 ${type.toLowerCase() === filterMap['pert'].toLowerCase() ? 'bg-gray-100' : 'hover:bg-gray-100'}`}
                        onClick={() => handleFilterChange(type, 'pert')}
                      >{type === '' ? 'None' : type[0].toUpperCase() + type.slice(1).toLowerCase()}</li>
                    )
                  })}
                </ul>
              </div>
            }
          </div>
        }
      </div>

      {(testData && testData.currentTests?.length > 0) ? (
        testData.currentTests.map((test: testType, index: number) => {
          return <Row key={index} test={test} isPertsFiltered={filterMap['pert'] !== ''} />
        })
      ) : (filterMap['label'] !== '') ? (
        <div className={'text-2xl text-center text-gray-500 pt-8'}>
          There are no '{filterMap['label']}' essays to show. <br />Either generate more essays or select a different filter.
        </div>
      ) : (
        <div className={'text-2xl text-center text-gray-500 pt-8'}>
          Please add a few sample tests using the textbox below to get started.
        </div>
      )}
    </div>
  );
}

export default TestList;
