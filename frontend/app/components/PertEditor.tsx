import React, { useContext, useEffect, useState } from 'react';
import { ThreeDots } from "react-loading-icons";
import {
  addNewPerturbation,
  getAllPerturbationTypes,
  testNewPerturbation,
  deletePerturbation,
  getPerturbationInfo,
  editPerturbation,
  logAction
} from '@/lib/Service';
import { TestDataContext } from '@/lib/TestContext';
import { perturbedTestType } from '@/lib/Types';

type PertEditorProps = {
  closeModal: () => void,
}

const PertEditor = ({ closeModal }: PertEditorProps) => {

  const { testData, setIsCurrent } = useContext(TestDataContext);

  // States for bad data in the form
  const [isFailedSubmit, setIsFailedSubmit] = useState(false);

  // States for perturbation types
  const [perturbations, setPerturbations] = useState([]);
  const [selectedPerturbation, setSelectedPerturbation] = useState("+");

  // Test pert states
  const [testResult, setTestResult] = useState('');
  const [isTestingPert, setIsTestingPert] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form value states
  const [type, setType] = useState('');
  const [aiPrompt, setAIPrompt] = useState('');
  const [testStatement, setTestStatement] = useState('For both the initial drop and hill, the greater the height, the more energy');
  const [testDirection, setTestDirection] = useState('');

  useEffect(() => {
    getAllPerturbationTypes().then((res) => {
      setPerturbations(res);
    })
  }, []);

  const handleSelectPert = (pertType: string) => {
    setSelectedPerturbation(pertType);
    if (pertType == "+") {
      setType('');
      setAIPrompt('');
      setTestDirection('');
      return;
    }
    getPerturbationInfo(pertType).then((res) => {
      setType(res.name);
      setAIPrompt(res.prompt);
      setTestDirection(res.flip_label ? 'DIR' : 'INV');
    });
  }

  // Calls the API to test the prompt on the statement
  const handleTestPerturbation = () => {
    // Check if all inputs are valid
    if (isTestingPert || !testStatement || !aiPrompt || !testDirection) {
      return;
    }

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
      logAction(["null"], `Add new criteria '${type}'. prompt: ${aiPrompt}, direction: ${testDirection}`);
      // Create new perts
      const tests = Object.values(testData.tests).flat();
      const newPerts: perturbedTestType[] = await addNewPerturbation(tests.filter((test) => test.perturbedTests.length != 0), type, aiPrompt, testDirection);

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

    submitPert()
  }

  const editPert = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!aiPrompt) {
      return;
    }
    setIsEditing(true);
    event.preventDefault()
    logAction(["null"], `Edit Criteria '${type}' to prompt: ${aiPrompt}, direction: ${testDirection}`);
    const tests = Object.values(testData.tests).flat();
    editPerturbation(tests.filter((test) => test.perturbedTests.some((ptest) => ptest.type.toLowerCase() == selectedPerturbation.toLowerCase())),
      selectedPerturbation, aiPrompt, testDirection).then(() => {
        setIsCurrent(false);
        setIsEditing(false);
        closeModal();
      });
  }

  const removePert = (event: React.MouseEvent<HTMLButtonElement>) => {
    setIsDeleting(true);
    event.preventDefault()
    logAction(["null"], `Delete Criteria ${type}`);
    deletePerturbation(selectedPerturbation).then(() => {
      getAllPerturbationTypes().then((res) => {
        setPerturbations(res);
      })
      setSelectedPerturbation("+");
      setIsDeleting(false);
      setIsCurrent(false);
    });
  }

  // Check if the perturbation a default
  const isDefault = (pertType: string) => ['spelling', 'negation', 'synonyms', 'paraphrase', 'acronyms', 'antonyms', 'spanish'].includes(pertType);

  return (

    <div className={'w-full h-full flex flex-col justify-between'}>

      {/* Header */}
      <div className={"text-2xl p-2 font-light w-full text-center"}>Criteria Editor</div>

      <div className={'flex p-2 gap-1 flex-wrap'}>
        <div className={"p-1"}>
          Criteria Type:
        </div>
        {perturbations.map((pert) => {
          return (
            <button className={`p-1 rounded ${selectedPerturbation == pert ? 'bg-blue-400' : 'bg-gray-200'}`} key={pert}
              onClick={() => handleSelectPert(pert)}>{pert}</button>
          )
        })}
        <button className={`p-1 rounded ${selectedPerturbation == '+' ? 'bg-green-400' : 'bg-gray-200'}`}
          onClick={() => handleSelectPert("+")}>Add New</button>
      </div>

      <div className={"flex flex-col items-center justify-center h-full"}>

        <form className={"px-8 py-2 mb-4 w-full"} onSubmit={handleSubmit}>

          {/* Type input */}
          <div className={"mb-4"}>
            <label className={"block text-gray-700 text-sm font-bold mb-2"} htmlFor="type">
              Type:
            </label>
            <input
              className={"shadow appearance-none border rounded w-2/5 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"}
              id="type" type="text" placeholder="synonyms, spelling, etc."
              disabled={selectedPerturbation != "+"} required
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
              disabled={isDefault(selectedPerturbation)} required
            />
          </div>

          {/* Test direction radio buttons */}
          <div className="mb-4">
            <span className="text-gray-700">Test Direction:</span>
            <div className="mt-2">
              <label className="inline-flex items-center">
                <input type="radio" className="form-radio" name="testDirection" value="INV"
                  checked={testDirection === 'INV'} onChange={(e) => setTestDirection(e.target.value)}
                  disabled={isDefault(selectedPerturbation)} required
                />
                <span className="ml-2">INV</span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input type="radio" className="form-radio" name="testDirection" value="DIR"
                  checked={testDirection === 'DIR'} onChange={(e) => setTestDirection(e.target.value)}
                  disabled={isDefault(selectedPerturbation)} required
                />
                <span className="ml-2">DIR</span>
              </label>
            </div>
          </div>

          {/* Testing prompt */}
          {!isDefault(selectedPerturbation) && (
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
                    type="submit" onClick={handleTestPerturbation}>
                    Test Prompt
                  </button>
                )}
                {/*{isFailedTest && <div className={'text-sm text-red-600 font-light ps-4'}>Please input a valid AI prompt and test statement</div>}*/}
              </div>
              <div
                className={"shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight mt-2"}
                id="testResult">
                {testResult}
              </div>
            </div>
          )}

          <div className={"flex gap-1"}>
            {/* Submit button */}
            {selectedPerturbation == "+" && <div className="flex items-center justify-between">
              {isSubmitting ? (
                <div className="bg-[#ecb127] h-10 w-60 py-2 px-4 rounded flex justify-center items-center">
                  <ThreeDots className="w-8 h-3" />
                </div>
              ) : (
                <button
                  className="bg-blue-700 hover:bg-blue-900 text-white h-10 w-60 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  type="submit">
                  Submit New Criteria
                </button>
              )}
            </div>}
            {/* Edit button */}
            {selectedPerturbation != "+" && !isDefault(selectedPerturbation) && <div className="flex items-center justify-between">
              {isEditing ? (
                <div className="bg-[#ecb127] h-10 w-60 py-2 px-4 rounded flex justify-center items-center">
                  <ThreeDots className="w-8 h-3" />
                </div>
              ) : (
                <button
                  className="bg-blue-700 hover:bg-blue-900 text-white h-10 w-60 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={(e) => editPert(e)}
                  type="submit">
                  Edit Criteria
                </button>
              )}
            </div>}
            {/* Delete button */}
            {selectedPerturbation != "+" && <div className="flex items-center justify-between">
              {isDeleting ? (
                <div className="bg-[#ecb127] h-10 w-60 py-2 px-4 rounded flex justify-center items-center">
                  <ThreeDots className="w-8 h-3" />
                </div>
              ) : (
                <button
                  className="bg-blue-700 hover:bg-blue-900 text-white h-10 w-60 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  onClick={(e) => removePert(e)}>
                  Remove Criteria
                </button>
              )}
            </div>}
          </div>

          {isFailedSubmit && <div className="text-red-500 text-xs italic">Please fill out all fields</div>}
        </form>
      </div>
    </div>
  );
};

export default PertEditor;
