import React, { useContext, useState, useEffect } from "react";
import { ThreeDots } from "react-loading-icons";
import { addTopic, logAction, testTopicPrompt } from "@/lib/Service";
import { TestDataContext } from "@/lib/TestContext";
import {
  MdOutlineCheckBox,
  MdOutlineCheckBoxOutlineBlank,
} from "react-icons/md";

type AddTopicFormProps = {
  closeModal: () => void;
};

const AddTopicForm = ({ closeModal }: AddTopicFormProps) => {
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isDefaultGradingPrompt, setIsDefaultGradingPrompt] = useState(true);

  // Array of tests and ground truths
  const [tests, setTests] = useState(Array(10).fill(""));
  const [ground_truths, setGround_truths] = useState(Array(10).fill(""));

  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [submitErrorMsg, setSubmitErrorMsg] = useState("");

  const { setIsCurrent, setCurrentTopic } = useContext(TestDataContext);

  const onTestChange = (index: number, value: string) => {
    const newTests = [...tests];
    newTests[index] = value;
    setTests(newTests);
  };

  const onCorrectnessChange = (index: number, value: string) => {
    const newGroundTruths = [...ground_truths];
    newGroundTruths[index] = value;
    setGround_truths(newGroundTruths);
  };

  const handleAddTopic = () => {
    setIsAddingTopic(true);
    const _name = name.trim();
    const _prompt = prompt.trim();
    if (_name === "" || _prompt === "" || tests.every((test) => test === "")) {
      // Create error message
      let errorMsg = "Please enter ";
      if (_name === "" || _prompt === "")
        errorMsg += "a topic name and prompt ";
      if (tests.every((test) => test === ""))
        errorMsg += `${_name === "" ? "and" : ""} at least one test`;
      setSubmitErrorMsg(errorMsg);
      setIsFailed(true);
      setIsAddingTopic(false);
      return;
    }

    const data = [];

    for (let i = 0; i < tests.length; i++) {
      const test = tests[i].trim();
      if (test != "") {
        if (ground_truths[i] == "") {
          setSubmitErrorMsg("Please select the ground truth for each test");
          setIsFailed(true);
          setIsAddingTopic(false);
          return;
        }
        data.push({
          test: test,
          ground_truth: ground_truths[i],
        });
      }
    }
    logAction(["NULL"], `Add new topic: ${name} with prompt: ${prompt}`);
    addTopic(_name, _prompt, data)
      .then(() => {
        setIsAddingTopic(false);
        setIsFailed(false);
        setIsCurrent(false);
        setCurrentTopic(_name);
        closeModal();
      })
      .catch((e) => {
        console.error(e);
        setIsAddingTopic(false);
        setSubmitErrorMsg("Failed to add topic");
        setIsFailed(true);
      });
  };

  // Reset grading prompt on checkbox change
  useEffect(() => {
    if (isDefaultGradingPrompt) {
      setPrompt(`Is this sentence an acceptable or unacceptable definition of ${name}? Here is the sentence:`);
    } else {
      setPrompt("");
    }
  }, [isDefaultGradingPrompt]);

  const onNameChange = (newName: string) => {
    setName(newName);
    if (isDefaultGradingPrompt) {
      setPrompt(`Is this sentence an acceptable or unacceptable definition of ${newName}? Here is the sentence:`);
    }
  }

  // Testing prompt

  const [isTesting, setIsTesting] = useState(false);
  const [testTopicOutput, setTestTopicOutput] = useState("");
  const isTestable = () => tests[0] !== '' && prompt !== '' && !isTesting;

  const handleTestPrompt = () => {
    if (!isTestable()) return;
    setIsTesting(true);
    logAction(["NULL"], `Test topic ${name} prompt "${prompt}" on ${tests[0]}`);
    testTopicPrompt(prompt, tests[0])
      .then(output => setTestTopicOutput(output))
      .finally(() => setIsTesting(false));
  }

  return (
    <div className={"w-full h-full flex flex-col"}>
      {/* Header */}
      <div className={"text-2xl p-2 font-light w-full text-center"}>
        Add New Topic
      </div>

      <div className={"flex flex-col items-center justify-center h-full"}>
        <div className={"px-8 py-2 mb-4 w-full"}>
          <div className={"mb-2"}>
            <label
              className={"block text-gray-700 text-sm font-bold mb-2"}
              htmlFor="type"
            >
              Topic (10 characters max):
            </label>
            <input
              className={
                "shadow appearance-none border rounded w-2/5 py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              }
              type="text"
              placeholder=""
              maxLength={10}
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
            />
          </div>

          <div className={"mb-2"}>
            <label
              className={"block text-gray-700 text-sm font-bold mb-2"}
              htmlFor="type"
            >
              Assessment Prompt:
            </label>
            <div className="flex items-center font-extralight -mt-2">
              Default:
              {!isDefaultGradingPrompt ? (
                <MdOutlineCheckBoxOutlineBlank
                  onClick={() => setIsDefaultGradingPrompt(true)}
                />
              ) : (
                <MdOutlineCheckBox
                  onClick={() => setIsDefaultGradingPrompt(false)}
                />
              )}
            </div>
            <input
              className={
                "shadow appearance-none border rounded w-4/5 py-1 px-2 text-sm text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              }
              type="text"
              placeholder="i.e. The following tests describe the concept of {topic}"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className={"mb-2"}>
            <label
              className={"block text-gray-700 text-sm font-bold mb-2"}
              htmlFor="type"
            >
              Tests:
            </label>
            {Array.from({ length: 10 }, (_, i) => {
              return (
                <div key={i} className={"flex gap-2 mb-1"}>
                  <input
                    className={
                      "shadow appearance-none border rounded w-4/5 py-1 px-2 text-gray-700 leading-tight text-sm focus:outline-none focus:shadow-outline"
                    }
                    type="text"
                    value={tests[i]}
                    onChange={(e) => onTestChange(i, e.target.value)}
                  />
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      value="acceptable"
                      checked={ground_truths[i] === "acceptable"}
                      onChange={(e) => onCorrectnessChange(i, e.target.value)}
                    />
                    <span className="ml-2">Acceptable</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio"
                      value="unacceptable"
                      checked={ground_truths[i] === "unacceptable"}
                      onChange={(e) => onCorrectnessChange(i, e.target.value)}
                    />
                    <span className="ml-2">Unacceptable</span>
                  </label>
                </div>
              );
            })}
          </div>

          <div className={"flex gap-2"}>
            {isTesting ? (
              <div className="h-8 w-72">
                <ThreeDots className={"w-8 h-3"} />
              </div>
            ) : (
              <button
                className={`${isTestable() ? 'bg-blue-700 hover:bg-blue-900' : 'bg-gray-500 cursor-default'} h-8 w-72 text-white font-bold py-1 px-4 rounded`}
                onClick={handleTestPrompt}
              >

                Test Prompt with first statement
              </button>

            )}
            <input
              className={
                "shadow appearance-none border rounded w-4/5 py-1 px-2 text-gray-700 leading-tight text-sm focus:outline-none focus:shadow-outline"
              }
              type="text"
              placeholder="Test output..."
              value={testTopicOutput}
              disabled
            />
          </div>

          <div className={"flex items-center"}>
            {isAddingTopic ? (
              <div
                className={
                  "bg-[#ecb127] h-10 w-32 py-2 px-4 rounded flex justify-center items-center"
                }
              >
                <ThreeDots className={"w-8 h-3"} />
              </div>
            ) : (
              <button
                className={
                  "bg-blue-700 hover:bg-blue-900 h-10 w-32 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"
                }
                type="button"
                onClick={handleAddTopic}
              >
                Add Topic
              </button>
            )}
            {isFailed && (
              <div className={"text-sm text-red-600 font-light ps-4"}>
                {submitErrorMsg}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTopicForm;
