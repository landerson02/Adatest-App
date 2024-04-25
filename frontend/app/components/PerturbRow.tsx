'use client';
import { perturbedTestType } from '@/lib/Types';
import { CiCircleCheck, CiCircleRemove } from 'react-icons/ci';
import { useContext } from 'react';
import { TestDataContext } from '@/lib/TestContext';
import { testDataType, testType } from '@/lib/Types';
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";


type PerturbRowProps = {
  pertTest: perturbedTestType
}

const PerturbRow = ({ pertTest }: PerturbRowProps) => {

  // Get test data
  const { testData, setTestData } = useContext(TestDataContext);

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
      decisions: testData.decisions,
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
      <div className={'text-md font-light w-[55%] pl-2'}>
        {pertTest.title}
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

