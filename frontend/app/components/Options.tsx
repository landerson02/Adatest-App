import { useState } from 'react';
import {logAction} from "@/lib/Service";

type optionsProps = {
    onPerturbationChange: (perturbation: string) => void; // New prop
}

const Options = ({onPerturbationChange} : optionsProps) => {
  const [selectedPerturbation, setSelectedPerturbation] = useState<string>(''); // New state

  const handlePerturbationChange = (newChoice: string) => { // New handler
    logAction(["null"], `Filter Graph Perturbation to ${newChoice}`);
    setSelectedPerturbation(newChoice);
    onPerturbationChange(newChoice);
  }

  return (
    <div className={'w-full h-1/6 items-center flex justify-between pt-10'}>
      <label className={'align-left ml-6 justify-start'} htmlFor="grouping">Set Criteria </label>
        <select
            name="perturbation"
            id="perturbation"
            value={selectedPerturbation}
            onChange={(e) => handlePerturbationChange(e.target.value)}
            className={'align-right mr-10 justify-end border border-gray-300 p-1 text-black rounded-lg'}
        >
            <option value={'spelling'}>Spelling</option>
            <option value={'negation'}>Negation</option>
            <option value={'synonyms'}>Synonyms</option>
            <option value={'paraphrase'}>Paraphrase</option>
            <option value={'acronyms'}>Acronyms</option>
            <option value={'antonyms'}>Antonyms</option>
            <option value={'spanish'}>Spanish</option>
        </select>
    </div>
  )
}

export default Options;
