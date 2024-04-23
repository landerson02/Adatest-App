'use client';
import { TestDataContext } from "@/lib/TestContext";
import { testType } from "@/lib/Types";
import { useContext, useState } from "react";
import { approveTests, denyTests, createPerturbations, logAction, trashTests, addTest } from "@/lib/Service";
import { ThreeDots } from "react-loading-icons";


type ButtonsProps = {
  currentTopic: string,
  isGenerating: boolean,
  genTests: () => void,
  setIsCurrent: (isCurrent: boolean) => void,
  isPerturbing: boolean,
  setIsPerturbing: (isPerturbing: boolean) => void,
}

export default ({ currentTopic, isGenerating, genTests, setIsCurrent, setIsPerturbing, isPerturbing }: ButtonsProps) => {

  // Get the test data
  const { testData } = useContext(TestDataContext);

  // If currently adding a test
  const [isAddingTest, setIsAddingTest] = useState(false);

  // Text of the test to be added
  const [addTestText, setAddTestText] = useState("");

  /**
   * Updates decisions for the checked tests
   * @param decision "approved" | "denied" | "trashed" The decision to make
   */
  async function decisionHandler(decision: "approved" | "denied" | "trashed") {
    let checkedTests = testData.currentTests.filter((test: testType) => test.isChecked);
    testData.decisions[currentTopic][decision].push(...checkedTests);

    // Get ids and log them
    let test_ids = checkedTests.map((test: testType) => test.id);
    await logAction(test_ids, decision);

    // Update decisions in db
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

  async function perturbHandler() {
    if (isPerturbing) return;
    setIsPerturbing(true);
    await logAction(["null"], "Perturb Essays");
    await createPerturbations(testData.currentTests.filter((test) => test.validity == "Approved" || test.validity == "Denied"), currentTopic);
    setIsPerturbing(false);
  }

  async function addTestHandler(label: string) {
    setIsAddingTest(true);
    await logAction(["null"], "Add Test");
    let newTest = {
      title: addTestText,
      label: label,
    } as testType;
    setAddTestText("");
    await addTest(newTest, currentTopic);
    setIsCurrent(false);
  }

  return (
    <div className="flex h-48 w-full items-center justify-between border-t border-black bg-gray-200 px-4">

      {/* Generate / Perturb */}
      <div className="h-full py-4 w-[20%]  flex flex-col justify-around">
        <div className="flex flex-col gap-4">
          {/* Generate */}
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

        {/* Perturb */}
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
      </div>

      {/* Add Test */}

      <div className="flex w-[60%] h-24 px-6 justify-around items-center gap-4">
        <textarea className="w-[80%] h-full" placeholder="Add new test here..." value={addTestText} onChange={(e) => { setAddTestText(e.target.value) }} />
        <div className="flex h-full flex-col justify-around">
          <button
            className={`flex h-8 w-48 items-center justify-center rounded-md font-light shadow-2xl transition ease-in-out ${addTestText === "" ? "bg-gray-500 cursor-default" : "bg-green-300 hover:scale-105 hover:bg-green-400 cursor-pointer"}`}
            onClick={() => {
              if (addTestText === "") return;
              addTestHandler("Acceptable");
            }}
          >
            Add as Acceptable
          </button>
          <button
            className={`flex h-8 w-48 items-center justify-center rounded-md font-light shadow-2xl transition ease-in-out ${addTestText === "" ? "bg-gray-500 cursor-default" : "bg-red-300 hover:scale-105 hover:bg-red-400 cursor-pointer"}`}
            onClick={() => {
              if (addTestText === "") return;
              addTestHandler("Unacceptable");
            }}
          >
            Add as Unacceptable
          </button>
        </div>

      </div>


      {/* Agree / Disagree / Trash */}
      <div className="w-[20%] flex justify-center items-center h-full">
        {testData.currentTests.some((test: testType) => test.isChecked) ? (
          <div className="flex flex-col justify-around h-full">
            <button
              className="flex h-10 w-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-green-700 bg-green-300 shadow-2xl transition ease-in-out hover:scale-105 hover:bg-green-400"
              onClick={() => decisionHandler("approved")}
            >
              Agree with AI Grade
            </button>
            <button
              className="flex h-10 w-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-red-700 bg-red-300 shadow-2xl transition ease-in-out hover:scale-105 hover:bg-red-400"
              onClick={() => decisionHandler("denied")}
            >
              Disagree with AI Grade
            </button>
            <button
              className="flex h-10 w-48 cursor-pointer items-center justify-center rounded-2xl border-2 border-blue-900 bg-blue-700 shadow-2xl font-light text-white transition hover:scale-105 hover:bg-blue-900"
              onClick={() => decisionHandler("trashed")}
            >
              Trash Selected Essays
            </button>
          </div>
        ) : (
          <div className="flex flex-col justify-around h-full">
            <div
              className="flex h-10 w-48 items-center justify-center rounded-2xl border-2 border-green-700 bg-green-300 opacity-50 transition ease-in-out"
            >
              Agree with AI Grade
            </div>
            <div
              className="flex h-10 w-48 items-center justify-center rounded-2xl border-2 border-red-700 bg-red-300 opacity-50 transition ease-in-out"
            >
              Disagree with AI Grade
            </div>
            <div
              className="flex h-10 w-48 items-center justify-center rounded-2xl border-2 border-blue-900 bg-blue-700 opacity-50 font-light text-white transition ease-in-out"
            >
              Trash Selected Essays
            </div>
          </div>
        )}
      </div>

    </div >
  )
}
