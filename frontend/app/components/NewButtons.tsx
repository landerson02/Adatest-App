import { TestDecisionsContext } from "@/lib/TestContext";
import { testType } from "@/lib/Types";
import { useContext } from "react";
import { approveTests, denyTests, generateTests, trashTests } from "@/lib/Service";


type newButtonsProps = {
  checkedTests: testType[],
  setCheckedTests: (tests: testType[]) => void,
  currentTopic: string,
  setCurrentTopic: (topic: string) => void,
  isGenerating: boolean,
  setIsGenerating: (isGenerating: boolean) => void,
}

export default function NewButtons({ checkedTests, setCheckedTests, currentTopic, isGenerating, setIsGenerating }: newButtonsProps) {
  const { testDecisions } = useContext(TestDecisionsContext);

  async function approveHandler() {
    testDecisions[currentTopic].approved.push(...checkedTests);
    await approveTests(checkedTests, currentTopic);
    setCheckedTests([]);
  }

  async function denyHandler() {
    testDecisions[currentTopic].denied.push(...checkedTests);
    await denyTests(checkedTests, currentTopic);
    setCheckedTests([]);
  }

  async function trashHandler() {
    testDecisions[currentTopic].trashed.push(...checkedTests);
    await trashTests(checkedTests, currentTopic);
    setCheckedTests([]);
  }

  async function generateHandler() {
    if (isGenerating) return;
    setIsGenerating(true);
    await generateTests(currentTopic);
    setIsGenerating(false);
  }

  return (
    <div className="w-full px-4 h-48 flex justify-between items-center bg-gray-200 border-t border-black">
      {/* Trash / Generate */}
      <div className="w-[25%] flex flex-col gap-4">
        <button
          className="w-48 h-8 bg-blue-700 flex justify-center items-center text-white font-light hover:bg-blue-900 rounded-md"
          onClick={trashHandler}
        >
          Trash Selected Essays
        </button>
        <button
          className="w-48 h-8 bg-blue-700 flex justify-center items-center text-white font-light hover:bg-blue-900 rounded-md"
          onClick={generateHandler}
        >
          Generate More Essays
        </button>
      </div>

      {/* Agree / Disagree */}
      <div className="ml-auto w-[25%] flex flex-col gap-4">
        {checkedTests.length === 0 ? (
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
