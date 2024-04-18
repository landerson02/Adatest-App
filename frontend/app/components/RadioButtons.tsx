'use client';
import { logAction } from "@/lib/Service";
import { useContext } from "react";
import { TestDataContext } from "@/lib/TestContext";
import { FaToggleOff, FaToggleOn } from "react-icons/fa6";


type RadioButtonProps = {
  text: string;
  isSelected: boolean;
}

// Helper component for buttons
function RadioButton({ text, isSelected }: RadioButtonProps) {
  return (
    isSelected ? (
      <div className={'w-16 h-12 border border-black rounded-md flex justify-center items-center bg-gray-300 text-3xl font-bold shadow-2xl'}>
        {text}
      </div>
    ) : (
      <div className={'w-16 h-12 border border-black rounded-md text-3xl font-light flex justify-center items-center hover:bg-gray-300 shadow-2xl cursor-pointer transition hover:scale-105'}>
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
 * @param currentTopic The current topic
 * @param setCurrentTopic Function to set the current topic
 */
function RadioButtons({ isAutoCheck, setIsAutoCheck }: RadioButtonsProps) {
  const {
    currentTopic,
    setCurrentTopic,
  } = useContext(TestDataContext);

  const handleTopicChange = (topic: string) => () => {
    logAction("null", `Change Topic to ${topic}`);
    setCurrentTopic(topic);
  }

  return (
    <div className={'flex justify-between items-center w-full'}>
      <div className={'flex gap-2'}>
        <div onClick={handleTopicChange('PE')}>
          <RadioButton text={'PE'} isSelected={currentTopic === 'PE'} />
        </div>
        <div onClick={handleTopicChange('KE')}>
          <RadioButton text={'KE'} isSelected={currentTopic === 'KE'} />
        </div>
        <div onClick={handleTopicChange('LCE')}>
          <RadioButton text={'LCE'} isSelected={currentTopic === 'LCE'} />
        </div>
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
