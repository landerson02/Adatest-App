
import { useState } from 'react';

type optionsProps = {
    onGroupByFunc: (groupBy: string) => void;
}

const Options = ({onGroupByFunc} : optionsProps) => {
  const [selectedGrouping, setSelectedGrouping] = useState<string>('');

  const handleSelectChange = (newChoice: string) => {
    setSelectedGrouping(newChoice);
    onGroupByFunc(newChoice);
  }
  return (
    <div className={'w-full h-full flex flex-col items-center'}>
      <label htmlFor="grouping">Group By:</label>
      <select
        name="grouping"
        id="grouping"
        value={selectedGrouping}
        onChange={(e) => handleSelectChange(e.target.value)}
        >
        <option value={''}>None</option>
        <option value={'acceptable'}>Acceptable</option>
        <option value={'unacceptable'}>Unacceptable</option>
        <option value={'/__suggestions'}>Suggestions</option>
      </select>
    </div>
  )
}

export default Options;
