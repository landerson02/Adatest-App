'use client';
import { logAction, resetDB, saveLogs } from "@/lib/Service";
import { useContext, useState } from "react";
import { TestDataContext } from "@/lib/TestContext";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";
import { ThreeDots } from "react-loading-icons";


type RadioButtonProps = {
  text: string;
  isSelected: boolean;
}

// Helper component for buttons
function RadioButton({ text, isSelected }: RadioButtonProps) {
  return (
    isSelected ? (
      <div className={'w-36 h-8 border border-black rounded-md flex justify-center items-center bg-blue-400 text-xl shadow-2xl scale-105'}>
        {text}
      </div>
    ) : (
      <div className={'w-36 h-8 border border-black rounded-md text-xl flex justify-center items-center bg-blue-100 hover:bg-blue-400 shadow-2xl cursor-pointer transition hover:scale-105'}>
        {text}
      </div>
    )
  );
}

type RadioButtonsProps = {
  isAutoCheck: boolean;
  setIsAutoCheck: (isAutoSelect: boolean) => void;
  setIsCurrent: (isCurrent: boolean) => void;
}

/**
 * Radio buttons to select topic
 * @param isAutoCheck if auto checkboxes is enabled
 * @param setIsAutoCheck
 * @param setIsCurrent
 */
function RadioButtons({ isAutoCheck, setIsAutoCheck, setIsCurrent }: RadioButtonsProps) {
  const {
    currentTopic,
    setCurrentTopic,
  } = useContext(TestDataContext);

  const handleTopicChange = (topic: string) => () => {
    logAction(["null"], `Change Topic to ${topic}`);
    setCurrentTopic(topic);
  }

  // If db is being reset
  const [isResetting, setIsResetting] = useState<boolean>(false);

  async function resetTests() {
    await logAction(["null"], 'Resetting Tests');
    if (confirm('Are you sure you want to end this session? \nThis will reset all the tests')) {
      setIsResetting(true);
      await saveLogs();
      await resetDB();
      setIsResetting(false);
      setIsCurrent(false);
    }
  }

  return (
    <div className={'flex justify-between items-center w-full pl-2'}>
      <div className={'flex gap-4'}>
        {/*<div onClick={handleTopicChange('PE')}>*/}
        {/*  <RadioButton text={'PE'} isSelected={currentTopic === 'PE'}/>*/}
        {/*</div>*/}
        {/*<div onClick={handleTopicChange('KE')}>*/}
        {/*  <RadioButton text={'KE'} isSelected={currentTopic === 'KE'}/>*/}
        {/*</div>*/}
        {/*<div onClick={handleTopicChange('LCE')}>*/}
        {/*  <RadioButton text={'LCE'} isSelected={currentTopic === 'LCE'}/>*/}
        {/*</div>*/}
        <div onClick={handleTopicChange('CU0')}>
          <RadioButton text={'Height/PE'} isSelected={currentTopic === 'CU0'} />
        </div>
        <div onClick={handleTopicChange('CU5')}>
          <RadioButton text={'Mass/Energy'} isSelected={currentTopic === 'CU5'} />
        </div>
      </div>

      <div className={'flex items-center gap-2 pr-4'}>
        {isResetting ? (
          <div className={'flex h-8 w-48 items-center justify-center rounded-md bg-gray-900 font-light text-white'}>
            <ThreeDots className="h-3 w-8" />
          </div>
        ) : (
          <button className={'flex h-8 w-48 cursor-pointer items-center justify-center rounded-md bg-gray-700 font-light text-white shadow-2xl transition hover:scale-105 hover:bg-gray-900'} onClick={resetTests}>
            End Session
          </button>
        )}
      </div>

      <div className={'flex items-center gap-2 pr-4'}>
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
