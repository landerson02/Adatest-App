import React, {useContext, useState} from 'react';
import {TestDecisionsContext} from "@/lib/TestContext";

interface RadioButtonProps {
  id: string;
  value: string;
  label: string;
  selectedOption: string | null;
  setSelectedOption: React.Dispatch<React.SetStateAction<string | null>>;
}

function RadioButton({ id, value, label, selectedOption, setSelectedOption }: RadioButtonProps) {
  const {currentTopic, setCurrentTopic} = useContext(TestDecisionsContext)
  return (
    <label htmlFor={id} className="cursor-pointer">
      <input
        type="radio"
        id={id}
        value={value}
        checked={selectedOption === value}
        onChange={() => {
            setSelectedOption(value)
            setCurrentTopic(value)
        }}
        className="hidden"
      />
      <span className={selectedOption === value ?
          'font-bold border-2 border-black bg-gray-300 px-2 rounded-md font-sans' :
          'hover:bg-gray-300 border-2 border-black px-2 rounded-md font-sans'}>{label}</span>
    </label>
  );
}

function RadioButtons() {
  const [selectedOption, setSelectedOption] = useState<string | null>("PE");
  const {currentTopic, setCurrentTopic} = useContext(TestDecisionsContext);

  const handleTopicChange = (topic: string) => () => {
    setCurrentTopic(topic);
    console.log(topic)
    console.log('top' + currentTopic);
  }
  return (
    // <div className={'flex gap-2 w-24'}>
    //   <RadioButton
    //     id="PE"
    //     value="PE"
    //     label="PE"
    //     selectedOption={selectedOption}
    //     setSelectedOption={setSelectedOption}
    //   />
    //   <RadioButton
    //     id="KE"
    //     value="KE"
    //     label="KE"
    //     selectedOption={selectedOption}
    //     setSelectedOption={setSelectedOption}
    //   />
    //   <RadioButton
    //     id="LCE"
    //     value="LCE"
    //     label="LCE"
    //     selectedOption={selectedOption}
    //     setSelectedOption={setSelectedOption}
    //   />
    // </div>
    <div className={'flex gap-2 w-24'}>
      <div
        onClick={handleTopicChange('PE')}
        className={currentTopic === 'PE' ? 'font-bold border gap-2 border-black bg-gray-300 px-2 rounded-md' : 'hover:bg-gray-300 border border-black px-2 rounded-md'}
      >PE</div>
      <div
        onClick={handleTopicChange('KE')}
        className={currentTopic === 'KE' ? 'font-bold border gap-2 border-black bg-gray-300 px-2 rounded-md' : 'hover:bg-gray-300 border border-black px-2 rounded-md'}
      >KE</div>
      <div
        onClick={handleTopicChange('LCE')}
        className={currentTopic === 'LCE' ? 'font-bold border gap-2 border-black bg-gray-300 px-2 rounded-md' : 'hover:bg-gray-300 border border-black px-2 rounded-md'}
      >LCE</div>
    </div>
  );
}

export default RadioButtons;
