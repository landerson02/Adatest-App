'use client';
import { TestDataContext } from "@/lib/TestContext";
import { perturbedTestType, testType } from "@/lib/Types";
import { useContext, useState, useEffect } from "react";
import { createPerturbations, logAction, addTest, validatePerturbations, processTests } from "@/lib/Service";
import { ThreeDots } from "react-loading-icons";
import PertEditor from "@/app/components/PertEditor";
import Popup from "@/app/components/Popup";
import { hasPerturbed } from "@/lib/utils";


type ButtonsProps = {
  currentTopic: string,
  isGenerating: boolean,
  genTests: () => void,
  isPerturbing: boolean,
  setIsPerturbing: (isPerturbing: boolean) => void,
}

export default ({ currentTopic, isGenerating, genTests, setIsPerturbing, isPerturbing }: ButtonsProps) => {

  // Get the test data
  const { testData, setIsCurrent } = useContext(TestDataContext);

  // If currently adding a test
  const [isAddingTest, setIsAddingTest] = useState(false);

  // Adjusting perts
  const [isPertEditorOpen, setIsPertEditorOpen] = useState(false);

  // Text of the test to be added
  const [addTestText, setAddTestText] = useState("");

  // If any tests are checked
  const [isNormalChecked, setIsNormalChecked] = useState(false);
  const [isPertChecked, setIsPertChecked] = useState(false);

  useEffect(() => {
    if (!testData.currentTests) return;
    setIsNormalChecked(testData.currentTests.some((test: testType) => test.isChecked));
    setIsPertChecked(testData.currentTests.some((test: testType) => test.perturbedTests.some((pt: perturbedTestType) => pt.isChecked)));
  }, [testData.currentTests]);

  // If any tests have been approved / denied
  // Used to determine if pert button should be disabled
  const [isAnyDecided, setIsAnyDecided] = useState(false);

  useEffect(() => {
    if (!testData.currentTests) return;
    setIsAnyDecided(testData.currentTests.some((test: testType) => test.validity === "approved" || test.validity === "denied"));
  }, [testData.currentTests]);

  /**
   * Updates decisions for the checked tests
   * @param decision "approved" | "denied" | "invalid" The decision to make
   */
  async function decisionHandler(decision: "approved" | "denied" | "invalid") {
    let checkedTests = testData.currentTests.filter((test: testType) => test.isChecked);

    // Get ids and log them
    let test_ids = checkedTests.map((test: testType) => test.id);
    await logAction(test_ids, decision);

    // Update decision in db
    await processTests(checkedTests, decision, currentTopic);

    // Handle perturbed test decisions

    let checkedPerts = testData.currentTests.map((test: testType) =>
      test.perturbedTests.filter((pertTest: perturbedTestType) => pertTest.isChecked)).flat();

    // Update pert decisions in db
    await validatePerturbations(checkedPerts, decision);

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
    await createPerturbations(testData.currentTests.filter((test) => test.validity == "approved" || test.validity == "denied"), currentTopic);
    setIsPerturbing(false);
  }

  async function addTestHandler(label: string) {
    setIsAddingTest(true);
    await logAction(["null"], "Add Test");
    let newTest = {
      title: addTestText,
    } as testType;
    setAddTestText("");
    await addTest(newTest, currentTopic, label);
    setIsCurrent(false);
    setIsAddingTest(false);
  }

  return (
    <div className="flex h-48 w-full items-center justify-between border-t border-black bg-gray-200 px-4">

      {/* Generate / Perturb */}
      <div className="flex h-full w-[20%]  flex-col justify-around py-4">
        <div className="flex flex-col gap-4">
          {/* Generate */}
          {isGenerating ? (
            <div
              className="flex h-8 w-52 items-center justify-center rounded-md bg-[#ecb127] font-light text-white"
            >
              <ThreeDots className="h-3 w-8" />
            </div>
          ) : (
            <button
              className="flex h-8 w-52 cursor-pointer items-center justify-center rounded-md bg-blue-700 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-blue-900"
              onClick={generateHandler}
            >
              Generate More Statements
            </button>
          )}
        </div>

        {/* Perturb */}
        {isPerturbing ? (
          <div
            className="flex h-8 w-52 items-center justify-center rounded-md bg-[#ecb127] font-light text-white"
          >
            <ThreeDots className="h-3 w-8" />
          </div>
        ) : (
          <button
            className={`flex h-8 w-52 items-center justify-center rounded-md bg-blue-700 font-light text-white shadow-2xl transition  ${isAnyDecided ? "hover:scale-105 hover:bg-blue-900" : "opacity-50 cursor-default "}`}
            onClick={isAnyDecided ? perturbHandler : () => { }}
          >
            Analyze AI Behavior
          </button>
        )}

        {/* Pert Editor */}
        <button
          className={`flex h-8 w-52 items-center justify-center rounded-md bg-blue-700 font-light text-white shadow-2xl transition  ${hasPerturbed(testData) ? "hover:scale-105 hover:bg-blue-900" : "opacity-50 cursor-default "}`}
          onClick={hasPerturbed(testData) ? () => setIsPertEditorOpen(true) : () => { }}

        >
          Criteria Editor
        </button>

        {isPertEditorOpen &&
          <Popup isOpen={isPertEditorOpen} closeModal={() => setIsPertEditorOpen(false)}>
            <PertEditor closeModal={() => setIsPertEditorOpen(false)} />
          </Popup>
        }

      </div>

      {/* Add Test */}
      {isAddingTest ? (
        <div className="flex h-28 w-[60%] items-center justify-around gap-4 px-6">
          <textarea className="h-full w-[80%] resize-none border border-gray-200 rounded p-1" disabled placeholder="Add new test here..." value={addTestText} onChange={(e) => { setAddTestText(e.target.value) }} />
          <div className="flex h-full flex-col justify-around">
            <div
              className="flex h-8 w-48 items-center justify-center rounded-md bg-[#ecb127] font-light text-white"
            >
              <ThreeDots className="h-3 w-8" />
            </div>
            <div
              className="flex h-8 w-48 items-center justify-center rounded-md bg-[#ecb127] font-light text-white"
            >
              <ThreeDots className="h-3 w-8" />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex h-28 w-[60%] items-center justify-around gap-4 px-6">
          <textarea className="h-full w-[80%] resize-none border border-gray-300 rounded p-1" placeholder="Add new test here..." value={addTestText} onChange={(e) => { setAddTestText(e.target.value) }} />
          <div className="flex h-full flex-col justify-around">
            <button
              className={`flex h-8 w-48 items-center justify-center rounded-md font-light shadow-2xl transition ease-in-out ${addTestText === "" ? "bg-gray-500 cursor-default" : "bg-green-300 hover:scale-105 hover:bg-green-400 cursor-pointer"}`}
              onClick={() => {
                if (addTestText === "") return;
                addTestHandler("acceptable");
              }}
            >
              Add as Acceptable
            </button>
            <button
              className={`flex h-8 w-48 items-center justify-center rounded-md font-light shadow-2xl transition ease-in-out ${addTestText === "" ? "bg-gray-500 cursor-default" : "bg-red-300 hover:scale-105 hover:bg-red-400 cursor-pointer"}`}
              onClick={() => {
                if (addTestText === "") return;
                addTestHandler("unacceptable");
              }}
            >
              Add as Unacceptable
            </button>
          </div>

        </div>

      )}


      {/* Agree / Disagree / Trash */}
      <div className="flex h-full w-[20%] flex-col items-center justify-around">
        <button
          className={`flex h-10 w-48 items-center justify-center rounded-2xl border-2 border-green-700 bg-green-300 shadow-2xl transition ease-in-out ${isNormalChecked || isPertChecked ? "hover:scale-105 hover:bg-green-400 cursor-pointer" : "cursor-default opacity-50"}`}
          onClick={() => {
            if (!isNormalChecked && !isPertChecked) return;
            decisionHandler("approved");
          }}
        >
          Agree with AI Grade
        </button>
        <button
          className={`flex h-10 w-48 items-center justify-center rounded-2xl border-2 border-red-700 bg-red-300 shadow-2xl transition ease-in-out ${isNormalChecked || isPertChecked ? "hover:scale-105 hover:bg-red-400 cursor-pointer" : "cursor-default opacity-50"}`}
          onClick={() => {
            if (!isNormalChecked && !isPertChecked) return;
            decisionHandler("denied");
          }}
        >
          Disagree with AI Grade
        </button>
        <button
          className={`flex h-10 w-48 items-center justify-center rounded-2xl border-2 border-blue-900 bg-blue-700 font-light text-white shadow-2xl transition ease-in-out ${isNormalChecked || isPertChecked ? "hover:scale-105 hover:bg-blue-900 cursor-pointer" : "cursor-default opacity-50"}`}
          onClick={() => {
            if (!isNormalChecked && !isPertChecked) return;
            decisionHandler("invalid");
          }}
        >
          Trash Selected Statements
        </button>
      </div>
      {/*</div >*/}

    </div >
  )
}
