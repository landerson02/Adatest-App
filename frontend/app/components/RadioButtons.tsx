'use client';
import { getTopics, logAction, resetDB, saveLogs, deleteTopic } from "@/lib/Service";
import { useContext, useEffect, useState } from "react";
import { TestDataContext } from "@/lib/TestContext";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";
import { ThreeDots } from "react-loading-icons";
import Popup from "@/app/components/Popup";
import AddTopicForm from "@/app/components/AddTopicForm";
import ResetTests from "@/app/components/ResetTests";


type RadioButtonProps = {
  text: string;
  isSelected: boolean;
}

// Helper component for buttons
function RadioButton({ text, isSelected }: RadioButtonProps) {
  return (
    isSelected ? (
      <div className={'w-28 h-8 border border-black rounded-md flex justify-center items-center bg-blue-400 shadow-2xl scale-105'}>
        {text}
      </div>
    ) : (
      <div className={'w-28 h-8 border border-black rounded-md flex justify-center items-center bg-blue-100 hover:bg-blue-400 shadow-2xl cursor-pointer transition hover:scale-105'}>
        {text}
      </div>
    )
  );
}

type RadioButtonsProps = {
  isAutoCheck: boolean;
  setIsAutoCheck: (isAutoSelect: boolean) => void;
}

/**
 * Radio buttons to select topic
 * @param isAutoCheck if auto checkboxes is enabled
 * @param setIsAutoCheck
 * @param setIsCurrent
 */
function RadioButtons({ isAutoCheck, setIsAutoCheck }: RadioButtonsProps) {
  const {
    currentTopic,
    setCurrentTopic,
    testData,
    setTestData,
    isCurrent,
    setIsCurrent
  } = useContext(TestDataContext);

  const handleTopicChange = (topic: string) => () => {
    logAction(["null"], `Change Topic to ${topic}`);
    setCurrentTopic(topic);
  }

  const [topics, setTopics] = useState<string[]>([]);

  // If db is being reset
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isResetOpen, setIsResetOpen] = useState<boolean>(false);

  // If topic is being deleted
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const [addTopicOpen, setAddTopicOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isCurrent) {
      getTopics().then((topics) => {
        setTopics(topics);
      });
    }
  }, [isCurrent]);

  async function resetTests(config: "AIBAT" | "Mini-AIBAT" | "M-AIBAT") {
    await logAction(["null"], 'Resetting Tests');
    setIsResetting(true);
    await saveLogs();
    await resetDB(config);
    const newTestData = { ...testData };
    newTestData.tests = {};
    newTestData.test_decisions = {};
    setTestData(newTestData);
    setIsResetting(false);
    setIsCurrent(false);
    setIsResetOpen(false);
  }

  async function removeTopic() {
    logAction(["null"], `Delete Topic ${currentTopic}`);
    const topicText = currentTopic == 'CU0' ? 'Height/PE' : currentTopic == 'CU5' ? 'Mass/Energy' : currentTopic;
    if (confirm(`Are you sure you want to delete the topic ${topicText}? \nThis will delete all the tests for this topic.`)) {
      setIsDeleting(true);
      await deleteTopic(currentTopic);
      const newTestData = { ...testData };
      delete newTestData.tests[currentTopic];
      delete newTestData.test_decisions[currentTopic];
      setTestData(newTestData);
      setIsDeleting(false);
      const topics = await getTopics()
      setCurrentTopic(topics[0]);
      setIsCurrent(false);
    }
  }

  return (
    <div className={'flex justify-between items-center w-full pl-2'}>
      <div className={"flex justify-between w-[70%]"}>
        <div className={'flex flex-wrap items-center gap-x-4 gap-y-1 w-[80%]'}>
          {
            topics.map((topic: string) => {
              return (
                <div key={topic} onClick={handleTopicChange(topic)}>
                  <RadioButton text={topic == 'CU0' ? 'Height/PE' : topic == 'CU5' ? 'Mass/Energy' : topic}
                    isSelected={currentTopic === topic} />
                </div>
              );
            })
          }
          <div
            className={'w-8 h-8 border border-black rounded-md flex justify-center items-center bg-green-100 hover:bg-green-400 shadow-2xl cursor-pointer transition hover:scale-105'}
            onClick={() => setAddTopicOpen(true)}>
            +
          </div>
          <Popup closeModal={() => setAddTopicOpen(false)} isOpen={addTopicOpen}>
            <AddTopicForm closeModal={() => setAddTopicOpen(false)} />
          </Popup>
        </div>

        <div className={'flex items-center justify-end w-[20%]'}>
          <div className={'flex flex-col gap-1'}>
            {isResetting ? (
              <div className={'flex h-8 w-32 items-center justify-center rounded-md bg-gray-900 font-light text-white'}>
                <ThreeDots className="h-3 w-8" />
              </div>
            ) : (
              <button className={'flex h-8 w-32 cursor-pointer items-center justify-center rounded-md bg-gray-700 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-gray-900'}
                      onClick={() => setIsResetOpen(true)}>
                End Session
              </button>
            )
            }
            <Popup isOpen={isResetOpen} closeModal={() => setIsResetOpen(false)}>
              <ResetTests resetTests={resetTests} isResetting={isResetting}/>
            </Popup>
            {isDeleting ? (
              <div className={'flex h-8 w-32 items-center justify-center rounded-md bg-red-200 font-light text-white'}>
                <ThreeDots className="h-3 w-8" />
              </div>
            ) : (
              <button className={'flex h-8 w-32 cursor-pointer items-center justify-center rounded-md bg-red-500 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-red-700'} onClick={removeTopic}>
                Delete Topic
              </button>
            )
            }
          </div>
        </div>
      </div>
      <div className={'flex items-center justify-end w-[30%]'}>
        <div className={'font-light text-black'}>
          Auto-Select First Checkbox:
        </div>
        {isAutoCheck ? (
          <FaToggleOn
            onClick={() => setIsAutoCheck(false)}
            className={'cursor-pointer w-8 h-8'}
          />
        ) : (
          <FaToggleOff
            onClick={() => setIsAutoCheck(true)}
            className={'cursor-pointer w-8 h-8'}
          />
        )}

      </div>
    </div>
  );
}

export default RadioButtons;
