'use client';
import { perturbedTestType, testType } from "@/lib/Types";
import { useState, useEffect, useContext, useRef } from "react";
import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { editTest, logAction } from "@/lib/Service";
import { IoIosArrowDropdownCircle, IoIosArrowDropupCircle } from "react-icons/io";
import PerturbRow from "@/app/components/PerturbRow";
import { TestDataContext } from "@/lib/TestContext";


type rowProps = {
  test: testType,
  toggleCheck: (test: testType) => void,
  setIsCurrent: (isCurrent: boolean) => void,
  isPertsFiltered: boolean,
  isPerturbed: boolean,
}

const Row = ({ test, toggleCheck, setIsCurrent, isPertsFiltered, isPerturbed }: rowProps) => {

  // Get test data
  const { currentTopic } = useContext(TestDataContext);

  // if the perturbation dropdown is showing
  const [isShowingPerts, setIsShowingPerts] = useState<boolean>(false);

  // if the test was edited
  const [newTest, setNewTest] = useState<string>("");

  // Reference to the text area
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to auto to recalculate
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; // Set height to fit content
    }
  }, [newTest]);

  // Reset drop down on any change
  useEffect(() => {
    // setIsShowingPerts(false);
    setNewTest(test.title);
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
    setNewTest(text);
  }

  async function onEditTest() {
    test.title = newTest;
    await editTest(test, currentTopic);
    setIsCurrent(false);
  }

  return (
    <>
      <div className={`border-gray-400 border-b w-full items-center flex flex-col justify-center py-2 ${test.validity === 'unapproved' ? 'bg-gray-50' : 'bg-gray-300'}`}>
        <div className={'w-full items-center flex'}>
          {/* CheckBox */}
          <div className="w-[5%] flex justify-center items-center" onClick={toggle}>
            {test.isChecked ? (
              <MdOutlineCheckBox className={'w-8 h-8 cursor-pointer'} />
            ) : (
              <MdOutlineCheckBoxOutlineBlank className={'w-8 h-8 cursor-pointer'} />
            )}
          </div>

          {/* Test Essay */}
          <div className={isPerturbed ? "w-[55%] flex justify-around items-center" : "w-[65%] flex justify-around items-center"}>
            <textarea className={`text-lg font-light w-[80%] px-2 resize-none ${test.validity === 'unapproved' ? 'bg-gray-50' : 'bg-gray-300'}`} value={newTest} ref={textareaRef}
              onChange={(e) => onEssayChange(e.target.value)} />
            <button className={`h-6 w-[15%] rounded-xl border 
            ${test.title != newTest ? 'bg-blue-300 cursor-pointer border-blue-500 transition ease-in-out hover:scale-105 hover:bg-blue-400' : 'bg-gray-200 border-gray-500 cursor-default'}`}
              onClick={() => {
                if (test.title != newTest) {
                  onEditTest().catch();
                }
              }}>
              Save
            </button>
          </div>

          {/* AI Grade */}
          <div className={'w-[17%] items-center'}>
            {
              test.label == "acceptable" ?
                <div className={'w-full flex justify-center'}>
                  <div className={'bg-green-50 text-green-500 rounded-md text-center ' +
                    'flex justify-left font-light border border-green-500 pr-1'}>
                    <CiCircleCheck className={'h-6 w-6 text-green-500'} />Acceptable
                  </div>
                </div> :
                <div className={'w-full flex justify-center'}>
                  <div className={'bg-red-50 text-red-500 rounded-md text-center ' +
                    'flex justify-left font-light border border-red-500 pr-1'}>
                    <CiCircleRemove className={'h-6 w-6 text-red-500'} /> Unacceptable
                  </div>
                </div>
            }
          </div>

          {/* Your Grade */}
          <div className={'w-[13%] items-center'}>
            {
              test.validity == "approved" ?
                <div className={'w-full flex justify-center'}>
                  <div className={'bg-green-50 text-green-500 rounded-md text-center ' +
                    'flex justify-left font-light border border-green-500 pr-1'}>
                    <CiCircleCheck className={'h-6 w-6 text-green-500'} />Agreed
                  </div>
                </div> : test.validity == "denied" ?
                  <div className={'w-full flex justify-center'}>
                    <div className={'bg-red-50 text-red-500 rounded-md text-center ' +
                      'flex justify-left font-light border border-red-500 pr-1'}>
                      <CiCircleRemove className={'h-6 w-6 text-red-500'} /> Disagreed
                    </div>
                  </div> :
                  <div className={'w-full flex justify-center'}>
                    <div className={'bg-gray-50 text-gray-500 rounded-md text-center ' +
                      'flex justify-left font-light border border-gray-500 px-1'}>
                      Ungraded
                    </div>
                  </div>
            }
          </div>

          {/* Perturbation drop down button */
            isPerturbed &&
            <div className={' w-[10%] text-center font-light flex justify-center items-center'}>
              {isShowingPerts ? (
                <IoIosArrowDropupCircle
                  className="w-6 h-6 text-blue-600 hover:cursor-pointer"
                  onClick={() => setIsShowingPerts(false)}
                />
              ) : (
                <IoIosArrowDropdownCircle
                  className={`w-6 h-6  ${pertList?.length == 0 ? 'hidden' : 'hover:cursor-pointer text-blue-600'}`}
                  onClick={() => {
                    if (pertList?.length == 0) {
                      return;
                    }
                    setIsShowingPerts(true);
                  }}
                />
              )}
            </div>
          }
        </div>
      </div>
      {/* Show perts if the dropdown is open OR if the perturbations are filtered */}
      {/* Auto show if filtered because theres only 1 */}
      {(isPertsFiltered || isShowingPerts)
        && pertList && pertList.length !== 0
        && pertList.map((pert: perturbedTestType, index: number) =>
          <PerturbRow key={index} pertTest={pert} setIsCurrent={setIsCurrent} />
        )}
    </>
  )
}

export default Row;
