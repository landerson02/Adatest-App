'use client';
import { TestDataContext } from "@/lib/TestContext";
import { testType } from "@/lib/Types";
import { useContext, useState, useEffect } from "react";
import { approveTests, denyTests, logAction, trashTests } from "@/lib/Service";
import test from "node:test";


type newButtonsProps = {
  currentTopic: string,
  setCurrentTopic: (topic: string) => void,
  isGenerating: boolean,
  setIsGenerating: (isGenerating: boolean) => void,
  genTests: () => void,
  setIsCurrent: (isCurrent: boolean) => void,
}

export default function NewButtons({ currentTopic, isGenerating, setIsGenerating, genTests, setIsCurrent }: newButtonsProps) {
  const { testData } = useContext(TestDataContext);

  const [isAnyChecked, setIsAnyChecked] = useState<boolean>(false);

  useEffect(() => {
    setIsAnyChecked(testData.currentTests.some((test: testType) => test.isChecked));
  }, [testData.currentTests]);

  async function approveHandler() {
    let checkedTests = testData.currentTests.filter((test: testType) => test.isChecked);
    testData.decisions[currentTopic].approved.push(...checkedTests);
    await logAction("null", "Agree With AI Grade");
    console.log('APP');
    console.log(checkedTests);
    console.log(currentTopic);
    await approveTests(checkedTests, currentTopic);
    setIsCurrent(false);

    // testData.decisions[currentTopic].approved.push(...checkedTests);
    // await logAction("null", "Agree With AI Grade");
    // await approveTests(checkedTests, currentTopic);
    // setCheckedTests([]);
    // setCheckedTestsSet(new Set());
    // setIsCurrent(false);
  }

  async function denyHandler() {
    // testData.decisions[currentTopic].denied.push(...checkedTests);
    // await logAction("null", "Disagree With AI Grade");
    // await denyTests(checkedTests, currentTopic);
    // setCheckedTests([]);
    // setCheckedTestsSet(new Set());
    // setIsCurrent(false);
  }

  async function trashHandler() {
    // testData.decisions[currentTopic].trashed.push(...checkedTests);
    // await logAction("null", "Trash Essays");
    // await trashTests(checkedTests, currentTopic);
    // setCheckedTests([]);
    // setCheckedTestsSet(new Set());
    // setIsCurrent(false);
  }

  async function generateHandler() {
    if (isGenerating) return;
    await genTests();
    await logAction("null", "Generate Essays");
    setIsCurrent(false);
  }

  return (
    <div className="w-full px-4 h-48 flex justify-between items-center bg-gray-200 border-t border-black">
      {/* Trash / Generate */}
      <div className="w-[25%] flex flex-col gap-4">
        {!isAnyChecked ? (
          <div
            className="w-48 h-8 bg-blue-900 opacity-50 flex justify-center items-center text-white font-light hover:bg-blue-900 rounded-md"
          >
            Trash Selected Essays
          </div>
        ) : (
          <button
            className="w-48 h-8 bg-blue-700 flex justify-center items-center text-white font-light hover:bg-blue-900 rounded-md"
            onClick={trashHandler}
          >
            Trash Selected Essays
          </button>
        )}
        {isGenerating ? (
          <div
            className="w-48 h-8 bg-orange-700 flex justify-center items-center text-white font-light hover:bg-blue-900 rounded-md"
          >
            Generating...
          </div>
        ) : (
          <button
            className="w-48 h-8 bg-blue-700 flex justify-center items-center text-white font-light hover:bg-blue-900 rounded-md"
            onClick={generateHandler}
          >
            Generate More Essays
          </button>
        )}
      </div>

      {/* Agree / Disagree */}
      <div className="ml-auto w-[25%] flex flex-col gap-4">
        {testData.currentTests.some(test => test.isChecked) ? (
          <>
            <div
              className="w-48 h-12 bg-green-300 border-2 border-green-700 rounded-2xl flex justify-center items-center transition ease-in-out opacity-50"
            >
              Agree with AI Grade
            </div>
            <div
              className="w-48 h-12 bg-red-300 border-2 border-red-700 rounded-2xl flex justify-center items-center transition ease-in-out opacity-50"
            >
              Disagree with AI Grade
            </div>
          </>
        ) : (
          <>
            <button
              className="w-48 h-12 bg-green-300 border-2 border-green-700 rounded-2xl flex justify-center items-center hover:bg-green-400 transition ease-in-out"
              onClick={approveHandler}
            >
              Agree with AI Grade
            </button>
            <button
              className="w-48 h-12 bg-red-300 border-2 border-red-700 rounded-2xl flex justify-center items-center hover:bg-red-400 transition ease-in-out"
              onClick={denyHandler}
            >
              Disagree with AI Grade
            </button>
          </>
        )}
      </div>

    </div >
  )
}
