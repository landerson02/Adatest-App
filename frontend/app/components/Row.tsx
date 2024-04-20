'use client';
import { perturbedTestType, testType } from "@/lib/Types";
import { useState, useEffect, useContext } from "react";
import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { logAction } from "@/lib/Service";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";
import PerturbRow from "@/app/components/PerturbRow";
import { TestDataContext } from "@/lib/TestContext";
import { testDataType } from "@/lib/Types";


type rowProps = {
  test: testType,
  currentTopic: string,
  setCurrentTopic: (topic: string) => void,
  toggleCheck: (test: testType) => void,
}

const Row = ({ test, toggleCheck }: rowProps) => {

  // Get test data
  const { setTestData, testData, currentTopic } = useContext(TestDataContext);

  // if the perturbation dropdown is showing
  const [isShowingPerts, setIsShowingPerts] = useState<boolean>(false);

  // Reset drop down on any change
  useEffect(() => {
    setIsShowingPerts(false);
  }, [test]);

  // List of perturbed tests
  const [pertList, setPertList] = useState<perturbedTestType[]>();

  // Load in perturbations
  useEffect(() => {
    // TODO: Load in Pert tests 
    // const perts = [] as perturbedTestType[];
    const perts = [
      { test: test, perturbation: 'Spelling Error' },
      { test: test, perturbation: 'Negation' },
      { test: test, perturbation: 'Synonyms' },
    ]
    setPertList(perts);
  }, [test]);

  // Toggle the checkbox
  function toggle() {
    toggleCheck(test);
    test.isChecked ? logAction(test.title, `Checkmark unchecked`) : logAction(test.title, `Checkmark checked`);
  }

  // Update the test essay in the context
  function onEssayChange(text: string) {
    // logAction(test.title, `Title changed to ${newTitle}`);
    const updatedTests = testData.currentTests.map((t: testType) => {
      if (test.id === t.id) {
        return { ...t, title: text };
      }
      return t;
    });

    // Create the new test data object
    let newData: testDataType = {
      tests: testData.tests,
      currentTests: updatedTests,
      decisions: testData.decisions,
    }

    setTestData(newData);
  }

  return (
    test.validity === 'Unapproved' && <div className={' border-gray-500 border-b w-full px-4 items-center flex flex-col pr-4'}>
      <div className={'w-full px-4 min-h-16 items-center flex pr-4'}>
        {/* CheckBox */}
        <div className="w-8 h-8" onClick={toggle}>
          {test.isChecked ? (
            <MdOutlineCheckBox className={'w-8 h-8 cursor-pointer'} />
          ) : (
            <MdOutlineCheckBoxOutlineBlank className={'w-8 h-8 cursor-pointer'} />
          )}
        </div>

        {/* Test Essay */}
        <textarea className={'text-md font-light w-[55%] pl-2 h-16'} value={test.title} onChange={(e) => onEssayChange(e.target.value)} />

        {/* AI Grade */}
        <div className={'ml-auto w-[25%] items-center'}>
          {
            test.label == "acceptable" || test.label == "Acceptable" ?
              <div className={'w-full flex justify-center'}>
                <div className={'bg-green-50 text-green-500 rounded-md text-xl text-center ' +
                  'flex justify-left font-light border border-green-500 pr-1'}>
                  <CiCircleCheck className={'h-6 w-6 pt-1 text-green-500'} />Acceptable
                </div>
              </div> :
              <div className={'w-full flex justify-center'}>
                <div className={'bg-red-50 text-red-500 rounded-md text-xl text-center ' +
                  'flex justify-left font-light border border-red-500 pr-1'}>
                  <CiCircleRemove className={'h-6 w-6 pt-1 text-red-500'} /> Unacceptable
                </div>
              </div>
          }
        </div>

        {/* Perturbation drop down button */}
        <div className={'w-[10%] text-center font-light flex justify-center items-center'}>
          {isShowingPerts ? (
            <IoIosArrowDropupCircle
              className="w-6 h-6 text-blue-600 hover:cursor-pointer"
              onClick={() => setIsShowingPerts(!isShowingPerts)}
            />
          ) : (
            <IoIosArrowDropdownCircle
              className="w-6 h-6 text-blue-600 hover:cursor-pointer"
              onClick={() => setIsShowingPerts(!isShowingPerts)}
            />
          )}
        </div>
      </div>
      {isShowingPerts && pertList && pertList.length !== 0 && pertList.map((pert: perturbedTestType, index: number) =>
        <PerturbRow key={index} pertTest={pert} />
      )}
    </div>
  )
}

export default Row;
