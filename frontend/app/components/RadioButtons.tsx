'use client';
import {addTopic, logAction, resetDB, saveLogs} from "@/lib/Service";
import {useContext, useEffect, useState} from "react";
import { TestDataContext } from "@/lib/TestContext";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";
import { ThreeDots } from "react-loading-icons";
import Popup from "@/app/components/Popup";


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

  const [addTopicOpen, setAddTopicOpen] = useState<boolean>(false);

  useEffect(() => {
    setTopics(Object.keys(testData.tests));
  }, [isCurrent]);

  async function resetTests() {
    await logAction(["null"], 'Resetting Tests');
    if (confirm('Are you sure you want to end this session? \nThis will reset all the tests')) {
      setIsResetting(true);
      setCurrentTopic('CU0');
      await saveLogs();
      await resetDB();
      setIsResetting(false);
      setIsCurrent(false);
    }
  }

  return (
    <div className={'flex justify-between items-center w-full pl-2'}>
      <div className={"flex justify-between w-[70%]"}>
        <div className={'flex gap-4'}>
          {
            topics.map((topic: string) => {
              return (
                <div key={topic} onClick={handleTopicChange(topic)}>
                  <RadioButton text={topic == 'CU0' ? 'Height/PE' : topic == 'CU5' ? 'Mass/Energy' : topic}
                               isSelected={currentTopic === topic}/>
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
            <div className={"flex justify-center"}>
              Add topic form
            </div>
          </Popup>
        </div>

        <div className={'flex items-center justify-end'}>
          {isResetting ? (
            <div className={'flex h-8 w-32 items-center justify-center rounded-md bg-gray-900 font-light text-white'}>
              <ThreeDots className="h-3 w-8" />
            </div>
          ) : (
            <button className={'flex h-8 w-32 cursor-pointer items-center justify-center rounded-md bg-gray-700 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-gray-900'} onClick={resetTests}>
              End Session
            </button>
          )}
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
