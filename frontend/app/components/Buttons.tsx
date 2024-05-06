'use client';
import { TestDataContext } from "@/lib/TestContext";
import { perturbedTestType, testType } from "@/lib/Types";
import { useContext, useState, useEffect } from "react";
import { approveTests, denyTests, createPerturbations, logAction, trashTests, addTest, validatePerturbations } from "@/lib/Service";
import { ThreeDots } from "react-loading-icons";


type ButtonsProps = {
  currentTopic: string,
  isGenerating: boolean,
  genTests: () => void,
  setIsCurrent: (isCurrent: boolean) => void,
  isPerturbing: boolean,
  setIsPerturbing: (isPerturbing: boolean) => void,
}

export default ({ currentTopic, isGenerating, genTests, setIsCurrent, setIsPerturbing, isPerturbing}: ButtonsProps) => {

  // Get the test data
  const { testData } = useContext(TestDataContext);

  // If currently adding a test
  const [isAddingTest, setIsAddingTest] = useState(false);

  // Text of the test to be added
  const [addTestText, setAddTestText] = useState("");

  // If any tests are checked
  const [isNormalChecked, setIsNormalChecked] = useState(false);
  const [isPertChecked, setIsPertChecked] = useState(false);

  useEffect(() => {
    setIsNormalChecked(testData.currentTests.some((test: testType) => test.isChecked));
    setIsPertChecked(testData.currentTests.some((test: testType) => test.perturbedTests.some((pt: perturbedTestType) => pt.isChecked)));
  }, [testData.currentTests]);

  // If any tests have been approved / denied
  // Used to determine if pert button should be disabled
  const [isAnyDecided, setIsAnyDecided] = useState(false);

  useEffect(() => {
    setIsAnyDecided(testData.currentTests.some((test: testType) => test.validity === "Approved" || test.validity === "Denied"));
  }, [testData.currentTests]);

  /**
   * Updates decisions for the checked tests - doesn't allow duplicates
   * @param checkedTests - The tests that are currently checked
   * @param decision - Decision of the button pressed
   */
  function testDecisionHandler(checkedTests: testType[], decision: string) {
    // Remove the test from all decisions
    const temp: testType[] = [];
    checkedTests.forEach((checkedTest: testType) => {
      ["approved", "denied", "invalid"].forEach((status) => {
        testData.test_decisions[currentTopic][status] = testData.test_decisions[currentTopic][status].filter((existingTest) =>
          !checkedTests.some((test) => existingTest.id === test.id)
        );
      });
      temp.push(checkedTest);
    });
    testData.test_decisions[currentTopic][decision].push(...temp);
  }

  /**
   * Updates decisions for the checked perturbations - doesn't allow duplicates
   * @param checkedPerts - The tests that are currently checked
   * @param decision - Decision of the button pressed
   */
  function pertDecisionHandler(checkedPerts: perturbedTestType[], decision: string) {
    const temp: perturbedTestType[] = [];
    // Remove the test from all decisions
    checkedPerts.forEach((checkedPert: perturbedTestType) => {
      ["approved", "denied", "invalid"].forEach((status) => {
        testData.pert_decisions[status] = testData.pert_decisions[status].filter((existingPert) =>
          !checkedPerts.some((pert) => existingPert.id === pert.id)
        );
      });
      temp.push(checkedPert);
    });
    testData.pert_decisions[decision.toLowerCase()].push(...temp);
  }

  /**
   * Updates decisions for the checked tests
   * @param decision "approved" | "denied" | "invalid" The decision to make
   */
  async function decisionHandler(decision: "approved" | "denied" | "invalid") {
    let checkedTests = testData.currentTests.filter((test: testType) => test.isChecked);
    // testDecisionHandler(checkedTests, decision);

    // Get ids and log them
    let test_ids = checkedTests.map((test: testType) => test.id);
    await logAction(test_ids, decision);

    // Update decisions in db
    if (decision === "approved") await approveTests(checkedTests, currentTopic);
    else if (decision === "denied") await denyTests(checkedTests, currentTopic);
    else if (decision === "invalid") await trashTests(checkedTests, currentTopic);
    else console.error("Invalid decision");

    // Handle perturbed test decisions

    let checkedPerts = testData.currentTests.map((test: testType) =>
      test.perturbedTests.filter((pertTest: perturbedTestType) => pertTest.isChecked)).flat();

    // Update pert decisions in db
    // set First char to uppercase
    decision = decision.charAt(0).toUpperCase() + decision.slice(1);
    await validatePerturbations(checkedPerts, decision);
    // pertDecisionHandler(checkedPerts, decision);

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
              className="flex h-8 w-48 items-center justify-center rounded-md bg-[#ecb127] font-light text-white"
            >
              <ThreeDots className="h-3 w-8" />
            </div>
          ) : (
            <button
              className="flex h-8 w-48 cursor-pointer items-center justify-center rounded-md bg-blue-700 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-blue-900"
              onClick={generateHandler}
            >
              Generate More Statements
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
            className={`flex h-8 w-48 items-center justify-center rounded-md bg-blue-700 font-light text-white shadow-2xl transition  ${isAnyDecided ? "hover:scale-105 hover:bg-blue-900" : "opacity-50 cursor-default "}`}
            onClick={isAnyDecided ? perturbHandler : () => { }}
          >
            Analyze AI Behavior
          </button>
        )}
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
          Trash Selected Essays
        </button>
      </div>
      {/*</div >*/}

    </div >
  )
}
