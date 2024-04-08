import { testType } from "@/lib/Types";
import { useState } from "react";
import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { MdOutlineCheckBox, MdOutlineCheckBoxOutlineBlank } from "react-icons/md";
import {logAction} from "@/lib/Service";

type rowProps = {
  test: testType,
  currentTopic: string,
  setCurrentTopic: (topic: string) => void,
  toggleCheck: (test: testType) => void,
  isSelected: boolean,
}

const Row = ({ test, toggleCheck, isSelected }: rowProps) => {

  function toggle() {
    toggleCheck(test);
    isSelected ? logAction(test.title, `Checkmark unchecked`) : logAction(test.title, `Checkmark checked`);
  }

  return (
    <div className={'border-gray-500 border-b w-full px-4 min-h-16 items-center flex pr-4'}>
      {/* CheckBox */}
      <div className="w-8 h-8" onClick={toggle}>
        {isSelected ? (
          <MdOutlineCheckBox className={'w-8 h-8 cursor-pointer'} />
        ) : (
          <MdOutlineCheckBoxOutlineBlank className={'w-8 h-8 cursor-pointer'} />
        )}
      </div>
      <div className={'text-md font-light w-[70%] pl-2'}>{test.title}</div>
      <div className={'ml-auto w-[25%] items-center'}>
        {
          test.label == "acceptable" || test.label == "Acceptable" ?
            <div className={'w-full flex justify-center'}>
              <div className={'bg-green-50 text-green-500 rounded-md text-xl text-center ' +
                'flex justify-left font-light border border-green-500 pr-1'}>
                <CiCircleCheck className={'h-6 w-6 pt-1 text-green-500'} />Acceptable
              </div>
            </div> :
            <div className={'w-full flex justify-center'}>
              <div className={'bg-red-50 text-red-500 rounded-md text-xl text-center ' +
                'flex justify-left font-light border border-red-500 pr-1'}>
                <CiCircleRemove className={'h-6 w-6 pt-1 text-red-500'} /> Unacceptable
              </div>
            </div>
        }
        {/* TODO: List the Capability */}
      </div>
    </div>
  )
}

export default Row;
