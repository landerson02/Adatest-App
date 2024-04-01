import { testType } from "@/lib/Types";
import { useState } from "react";
import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { IoIosCheckbox, IoIosCheckboxOutline } from "react-icons/io";

type rowProps = {
  test: testType,
  currentTopic: string,
  setCurrentTopic: (topic: string) => void,
  toggleCheck: (test: testType) => void,
}

const Row = ({ test, toggleCheck }: rowProps) => {
  const [isSelected, setIsSelected] = useState(false);

  function toggle() {
    setIsSelected(!isSelected);
    console.log(isSelected);
    toggleCheck(test);
  }

  return (
    <div className={'border-gray-500 border-b w-full min-h-16 items-center flex justify-between pr-4'}>
      {/* CheckBox */}
      <div className="w-8 h-8" onClick={toggle}>
        {isSelected ? (
          <IoIosCheckbox className={'w-8 h-8'} />
        ) : (
          <IoIosCheckboxOutline className={'w-8 h-8'} />
        )}
      </div>
      <div className={'text-md font-light w-[60%]'}>{test.title}</div>
      <div className={'ml-auto flex w-[40%] justify-between'}>
        {
          test.label == "acceptable" || test.label == "Acceptable" ?
            <div className={'w-[50%] flex justify-center'}>
              <div className={'bg-green-50 text-green-500 rounded-md text-xl text-center ' +
                'flex justify-left font-light border border-green-500 pr-1'}>
                <CiCircleCheck className={'h-6 w-6 pt-1 text-green-500'} />Acceptable
              </div>
            </div> :
            <div className={'w-[50%] flex justify-center'}>
              <div className={'bg-red-50 text-red-500 rounded-md text-xl text-center ' +
                'flex justify-left font-light border border-red-500 pr-1'}>
                <CiCircleRemove className={'h-6 w-6 pt-1 text-red-500'} /> Unacceptable
              </div>
            </div>
        }
        {/* List the capability */}
        <div className={'w-[40%]'}>
          TBD
        </div>
      </div>
    </div>
  )
}

export default Row;
