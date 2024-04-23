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
    setPertList(test.perturbedTests)
  }, [test]);

  // Toggle the checkbox
  function toggle() {
    toggleCheck(test);
    test.isChecked ? logAction([test.id], `Checkmark unchecked`) : logAction([test.id], `Checkmark checked`);
  }

  // Update the test essay in the context
  function onEssayChange(text: string) {
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
     <div className={' border-gray-500 border-b w-full px-4 items-center flex flex-col pr-4'}>
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
        <textarea className={'text-md font-light w-[50%] pl-2 h-16'} value={test.title} onChange={(e) => onEssayChange(e.target.value)} />

        {/* AI Grade */}
        <div className={'ml-auto w-[20%] items-center'}>
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

        <div className={'ml-auto w-[20%] items-center'}>
          {
            test.validity == "Approved" || test.validity == "approved" ?
              <div className={'w-full flex justify-center'}>
                <div className={'bg-green-50 text-green-500 rounded-md text-xl text-center ' +
                  'flex justify-left font-light border border-green-500 pr-1'}>
                  <CiCircleCheck className={'h-6 w-6 pt-1 text-green-500'} />Agreed
                </div>
              </div> : test.validity == "Denied" || test.validity == "denied" ?
              <div className={'w-full flex justify-center'}>
                <div className={'bg-red-50 text-red-500 rounded-md text-xl text-center ' +
                  'flex justify-left font-light border border-red-500 pr-1'}>
                  <CiCircleRemove className={'h-6 w-6 pt-1 text-red-500'} /> Disagreed
                </div>
                Consider a primal linear programming problem in standard form.

                Mark all the correct answers.

                Group of answer choices

                The complementary slackness conditions are always satisfied.

                Given an optimal basic feasible solution to the primal, by imposing the complementary slackness condition we can compute an optimal dual solution.

                If the primal is infeasible, we can find a hyperplane that separates the columns of A from b.</div> :
              <div className={'w-full flex justify-center'}>
                <div className={'bg-gray-50 text-gray-500 rounded-md text-xl text-center ' +
                  'flex justify-left font-light border border-gray-500 px-1'}>
                  Ungraded
                </div>
              </div>
          }
        </div>

        {/* Perturbation drop down button */}
        <div className={' w-[10%] text-center font-light flex justify-center items-center'}>
          {isShowingPerts ? (
            <IoIosArrowDropupCircle
              className="w-6 h-6 text-blue-600 hover:cursor-pointer"
              onClick={() => setIsShowingPerts(!isShowingPerts)}
            />
          ) : (
            <IoIosArrowDropdownCircle
              className={`w-6 h-6  ${pertList?.length == 0 ? 'hidden' : 'hover:cursor-pointer text-blue-600'}`}
              onClick={() => {
                if (pertList?.length == 0) {
                  return;
                }
                setIsShowingPerts(!isShowingPerts)
              }}
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
