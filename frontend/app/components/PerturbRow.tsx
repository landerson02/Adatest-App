'use client';
import { perturbedTestType } from '@/lib/Types';
import { CiCircleCheck, CiCircleRemove } from 'react-icons/ci';
import { useContext, useRef, useEffect, useState } from 'react';
import { TestDataContext } from '@/lib/TestContext';
import { testDataType, testType } from '@/lib/Types';
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import { editTest } from '@/lib/Service';


type PerturbRowProps = {
  pertTest: perturbedTestType
  setIsCurrent: (isCurrent: boolean) => void
}

const PerturbRow = ({ pertTest, setIsCurrent }: PerturbRowProps) => {

  // Get test data
  const { testData, setTestData, currentTopic } = useContext(TestDataContext);

  // If test is being edited
  const [newTest, setNewTest] = useState<string>("");

  useEffect(() => {
    setNewTest(pertTest.title);
  }, [pertTest]);

  // Update the test essay on change
  function onEssayChange(text: string) {
    setNewTest(text);
  }

  async function onEditTest() {
    pertTest.title = newTest;
    await editTest(pertTest, currentTopic, true);
    setIsCurrent(false);
  }

  // Ref for text area
  // allows for dynamic resizing of text area
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Adjust size of text area
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'; // Reset height to auto to recalculate
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'; // Set height to fit content
    }
  }, [newTest]);

  /**
   * Toggle if a test is checked
   * @param test test to toggle
   */
  function togglePertCheck() {

    // Find parent test
    const parent = testData.currentTests.find((test: testType) => test.id === pertTest.test_parent);

    if (!parent) throw new Error('Parent test not found');

    // Find perturbation
    const pert = parent.perturbedTests.find((p: perturbedTestType) => p.id === pertTest.id);

    if (!pert) throw new Error('Perturbation not found');

    // Toggle checkbox
    pert.isChecked = !pert.isChecked;

    const updatedTests = testData.currentTests.map((test: testType) => {
      if (test.id === parent.id) {
        return { ...test, perturbedTests: parent.perturbedTests };
      }
      return test;
    });

    // Create the new test data object
    let newData: testDataType = {
      tests: testData.tests,
      currentTests: updatedTests,
      test_decisions: testData.test_decisions,
      pert_decisions: testData.pert_decisions,
    }

    setTestData(newData);
  }

  return (
    <div className={'w-full py-3 px-2 flex items-center border-b border-r bg-gray-100 border-gray-400'}>
      {/* Checkbox Placeholder */}
      <div className={"w-[5%] flex justify-center items-center"} onClick={togglePertCheck}>
        {pertTest.isChecked ? (
          <MdOutlineCheckBox className={'w-6 h-6 cursor-pointer'} />
        ) : (
          <MdOutlineCheckBoxOutlineBlank className={'w-6 h-6 cursor-pointer'} />
        )}
      </div>

      {/* Test Essay */}
      <div className={'text-md font-light flex justify-around items-center w-[55%] pl-2'}>
        <textarea
          className={'w-[80%] text-md font-light px-2 resize-none bg-gray-50'}
          value={newTest}
          ref={textareaRef}
          onChange={(e) => onEssayChange(e.target.value)}
        />
        <button className={`h-6 w-[15%] rounded-xl border 
            ${pertTest.title != newTest ? 'bg-blue-300 cursor-pointer border-blue-500 transition ease-in-out hover:scale-105 hover:bg-blue-400' : 'bg-gray-200 border-gray-500 cursor-default'}`}
          onClick={() => {
            if (pertTest.title != newTest) {
              onEditTest().catch();
            }
          }}>
          Save
        </button>
      </div>

      {/* AI Grade */}
      <div className={'w-[17%] items-center'}>
        {
          pertTest.label.toLowerCase() == "acceptable" ?
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

      {/* Your Grade Placeholder */}
      <div className={'w-[13%] items-center'}>
        {pertTest.validity?.toLowerCase() == "approved" ? (
          <div className={'w-full flex justify-center'}>
            <div className={'bg-green-50 text-green-500 rounded-md text-center ' +
              'flex justify-left font-light border border-green-500 pr-1'}>
              <CiCircleCheck className={'h-6 w-6 text-green-500'} />Agreed
            </div>
          </div>
        ) : (
          pertTest.validity?.toLowerCase() == "denied" ? (
            <div className={'w-full flex justify-center'}>
              <div className={'bg-red-50 text-red-500 rounded-md text-center ' +
                'flex justify-left font-light border border-red-500 pr-1'}>
                <CiCircleRemove className={'h-6 w-6 text-red-500'} /> Disagreed
              </div>
            </div>
          ) : (
            <div className={'w-full flex justify-center'}>
              <div className={'bg-gray-50 text-gray-500 rounded-md text-center ' +
                'flex justify-left font-light border border-gray-500 px-1'}>
                Ungraded
              </div>
            </div>
          )
        )
        }
      </div>

      {/* Perturbation */}
      <div className={'w-[10%] text-center font-light'}>
        {pertTest.type[0].toUpperCase() + pertTest.type.slice(1).toLowerCase()}
      </div>
    </div>
  )
}

export default PerturbRow;

