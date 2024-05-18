import React, { useState, useContext } from 'react';
import { ThreeDots } from "react-loading-icons";
import { addNewPerturbation, testNewPerturbation } from '@/lib/Service';
import { TestDataContext } from '@/lib/TestContext';
import { perturbedTestType } from '@/lib/Types';

type AddPertFormProps = {
  closeModal: () => void,
  setIsCurrent: (isCurrent: boolean) => void,
}

const AddPertForm = ({ closeModal, setIsCurrent }: AddPertFormProps) => {

  const { currentTopic, testData, setTestData } = useContext(TestDataContext);

  // States for bad data in the form
  const [isFailedSubmit, setIsFailedSubmit] = useState(false);
  const [isFailedTest, setIsFailedTest] = useState(false);

  // Test pert states
  const [testResult, setTestResult] = useState('');
  const [isTestingPert, setIsTestingPert] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form value states
  const [type, setType] = useState('');
  const [aiPrompt, setAIPrompt] = useState('');
  const [testStatement, setTestStatement] = useState('For both the initial drop and hill, the greater the height, the more energy');
  const [testDirection, setTestDirection] = useState('');

  // Calls the API to test the prompt on the statement
  const handleTestPerturbation = () => {
    // Check if all inputs are valid
    if (isTestingPert || !testStatement || !aiPrompt || !testDirection) {
      setIsFailedTest(true);
      return;
    }
    setIsFailedTest(false);

    setIsTestingPert(true);

    // Test the perturbation
    testNewPerturbation(type, aiPrompt, testStatement, testDirection).then((testedPert) => {
      if (testedPert) {
        setTestResult(testedPert.toString());
        setIsTestingPert(false);
      } else {
        console.error('Failed to test perturbation');
        setIsTestingPert(false);
      }
    });
  };

  // Creates a new perturbation type
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Check if all inputs are valid
    if (isSubmitting || !type || !aiPrompt || !testStatement || !testDirection) {
      setIsFailedSubmit(true);
      return;
    }
    setIsFailedSubmit(false);
    setIsSubmitting(true);

    // Generate and load new perts
    async function submitPert() {
      // Get new perts
      const newPerts: perturbedTestType[] = await addNewPerturbation(testData.currentTests.filter((test) => test.validity == "approved" || test.validity == "denied"), type, aiPrompt, testDirection, currentTopic);
      console.log(newPerts);

      // Check if valid response
      if (!newPerts) {
        console.error('Failed to generate new perturbations');
        setIsSubmitting(false);
        return;
      }

      // Update the context with the new perturbations
      setIsCurrent(false);
      setIsSubmitting(false);
      closeModal();
    }

    submitPert();
  }

  return (

    <div className={'w-full h-full flex flex-col justify-between'}>

      {/* Header */}
      <div className={"text-3xl pt-2 font-light w-full text-center"}>Create A New Perturbation</div>

      <div className={"flex flex-col items-center justify-center p-2 h-full"}>

        <form className={"bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full"} onSubmit={handleSubmit}>

          {/* Type input */}
          <div className={"mb-4"}>
            <label className={"block text-gray-700 text-sm font-bold mb-2"} htmlFor="type">
              Type:
            </label>
            <input
              className={"shadow appearance-none border rounded w-2/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
              id="type" type="text" placeholder="synonyms, spelling, etc."
              value={type} onChange={(e) => setType(e.target.value)}
            />
          </div>

          {/* AI Prompt input */}
          <div className={"mb-4"}>
            <label className={"block text-gray-700 text-sm font-bold mb-2"} htmlFor="prompt">
              AI Prompt:
            </label>
            <input
              className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
              id="prompt" type="text" placeholder="Ex: Add spelling errors to the statement"
              value={aiPrompt} onChange={(e) => setAIPrompt(e.target.value)}
            />
          </div>

          {/* Test direction radio buttons */}
          <div className="mb-4">
            <span className="text-gray-700">Test Direction:</span>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="testDirection" value="INV"
                  checked={testDirection === 'INV'} onChange={(e) => setTestDirection(e.target.value)}
                />
                <span className="ml-2">INV</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input type="radio" className="form-radio" name="testDirection" value="DIR"
                  checked={testDirection === 'DIR'} onChange={(e) => setTestDirection(e.target.value)}
                />
                <span className="ml-2">DIR</span>
              </label>
            </div>
          </div>

          {/* Testing prompt */}
          <div className={"mb-4"}>
            <label className={"block text-gray-700 text-sm font-bold mb-2"} htmlFor="testPrompt">
              Test Statement:
            </label>
            <input
              className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
              id="testPrompt" type="text" placeholder="Test Statement"
              value={testStatement} onChange={(e) => setTestStatement(e.target.value)}
            />
            <div className={'flex items-center'}>
              {isTestingPert ? (
                <div className={'bg-[#ecb127] h-10 w-32 py-2 px-4 rounded flex justify-center items-center'}>
                  <ThreeDots className={'w-8 h-3'} />
                </div>
              ) : (
                <button
                  className={"bg-blue-700 hover:bg-blue-900 h-10 w-32 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mt-2"}
                  type="button" onClick={handleTestPerturbation}>
                  Test Prompt
                </button>
              )}
              {isFailedTest && <div className={'text-sm text-red-600 font-light ps-4'}>Please input a valid AI prompt and test statement</div>}
            </div>
            <div
              className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight mt-2"}
              id="testResult">
              {testResult}
            </div>
          </div>


          {/* Submit button */}
          <div className="flex items-center justify-between">
            {isSubmitting ? (
              <div className="bg-[#ecb127] h-10 w-60 py-2 px-4 rounded flex justify-center items-center">
                <ThreeDots className="w-8 h-3" />
              </div>
            ) : (
              <button
                className="bg-blue-700 hover:bg-blue-900 text-white h-10 w-60 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                type="submit">
                Submit New Perturbation
              </button>
            )}
          </div>
          {isFailedSubmit && <div className="text-red-500 text-xs italic">Please fill out all fields</div>}
        </form>
      </div>
    </div>
  );
};

export default AddPertForm;
