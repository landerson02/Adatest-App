'use client';
import { TestDataContext } from "@/lib/TestContext";
import { testType } from "@/lib/Types";
import { useContext, useState } from "react";
import { approveTests, denyTests, logAction, trashTests } from "@/lib/Service";
import { ThreeDots } from "react-loading-icons";


type ButtonsProps = {
  currentTopic: string,
  isGenerating: boolean,
  genTests: () => void,
  setIsCurrent: (isCurrent: boolean) => void,
}

export default ({ currentTopic, isGenerating, genTests, setIsCurrent }: ButtonsProps) => {

  // Get the test data
  const { testData } = useContext(TestDataContext);

  /**
   * Updates decisions for the checked tests
   * @param decision "approved" | "denied" | "trashed" The decision to make
   */
  async function decisionHandler(decision: "approved" | "denied" | "trashed") {
    let checkedTests = testData.currentTests.filter((test: testType) => test.isChecked);
    testData.decisions[currentTopic][decision].push(...checkedTests);
    let test_ids = checkedTests.map((test: testType) => test.id);
    await logAction(test_ids, decision);
    if (decision === "approved") await approveTests(checkedTests, currentTopic);
    else if (decision === "denied") await denyTests(checkedTests, currentTopic);
    else if (decision === "trashed") await trashTests(checkedTests, currentTopic);
    else console.error("Invalid decision");
    setIsCurrent(false);
  }

  async function generateHandler() {
    if (isGenerating) return;
    await genTests();
    await logAction(["null"], "Generate Essays");
    setIsCurrent(false);
  }

  const [isPerturbing, setIsPerturbing] = useState(false);

  async function perturbHandler() {
    if (isPerturbing) return;
    setIsPerturbing(true);
    await logAction(["null"], "Perturb Essays");
    // TODO: Add perturbation logic
    setIsPerturbing(false);
  }

  return (
    <div className="flex h-48 w-full items-center justify-between border-t border-black bg-gray-200 px-4">
      {/* Trash / Generate */}
      <div className="flex w-[25%] flex-col gap-4">
        {testData.currentTests.some((test: testType) => test.isChecked) ? (
          <button
            className="flex h-8 w-48 items-center justify-center rounded-md bg-blue-700 font-light text-white transition hover:scale-105 hover:bg-blue-900"
            onClick={() => decisionHandler("trashed")}
          >
            Trash Selected Essays
          </button>
        ) : (
          <div
            className="flex h-8 w-48 items-center justify-center rounded-md bg-blue-900 font-light text-white opacity-50 hover:bg-blue-900"
          >
            Trash Selected Essays
          </div>
        )}
        {isGenerating ? (
          <div
            className="flex h-8 w-48 items-center justify-center rounded-md bg-[#ecb127] font-light text-white"
          >
            <ThreeDots className="h-3 w-8" />
          </div>
        ) : (
          <button
            className="flex h-8 w-48 cursor-pointer items-center justify-center rounded-md bg-blue-700 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-blue-900"
            onClick={generateHandler}
          >
            Generate More Essays
          </button>
        )}
      </div>

      {/* Generate Perturbations */}
      {isPerturbing ? (
        <div
          className="flex h-8 w-48 items-center justify-center rounded-md bg-[#ecb127] font-light text-white"
        >
          <ThreeDots className="h-3 w-8" />
        </div>
      ) : (
        <button
          className="flex h-8 w-48 cursor-pointer items-center justify-center rounded-md bg-blue-700 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-blue-900"
          onClick={perturbHandler}
        >
          Perturb Essays
        </button>
      )}



      {/* Agree / Disagree */}
      <div className="ml-auto flex w-[25%] flex-col gap-4">
        {testData.currentTests.some((test: testType) => test.isChecked) ? (
          <>
            <button
              className="flex h-12 w-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-green-700 bg-green-300 shadow-2xl transition ease-in-out hover:scale-105 hover:bg-green-400"
              onClick={() => decisionHandler("approved")}
            >
              Agree with AI Grade
            </button>
            <button
              className="flex h-12 w-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-red-700 bg-red-300 shadow-2xl transition ease-in-out hover:scale-105 hover:bg-red-400"
              onClick={() => decisionHandler("denied")}
            >
              Disagree with AI Grade
            </button>
          </>
        ) : (
          <>
            <div
              className="flex h-12 w-48 items-center justify-center rounded-2xl border-2 border-green-700 bg-green-300 opacity-50 transition ease-in-out"
            >
              Agree with AI Grade
            </div>
            <div
              className="flex h-12 w-48 items-center justify-center rounded-2xl border-2 border-red-700 bg-red-300 opacity-50 transition ease-in-out"
            >
              Disagree with AI Grade
            </div>
          </>
        )}
      </div>

    </div >
  )
}
