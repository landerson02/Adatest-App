import { logAction } from "@/lib/Service";


type RadioButtonsProps = {
  currentTopic: string;
  setCurrentTopic: (topic: string) => void;
}

/**
 * Radio buttons to select topic
 * @param setT: function to set topic
 */
function RadioButtons({ currentTopic, setCurrentTopic }: RadioButtonsProps) {

  const handleTopicChange = (topic: string) => () => {
    logAction(["null"], `Change Topic to ${topic}`);
    setCurrentTopic(topic);
  }

  return (
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
