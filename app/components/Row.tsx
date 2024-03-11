import { testType } from "@/lib/Types";
import Buttons from "@/app/components/Buttons";
import {CiCircleCheck, CiCircleRemove} from "react-icons/ci";

type rowProps = {
  test: testType,
}

const Row = ({ test } : rowProps) => {
  return (
    <div className={'border-gray-500 border-b-2 w-full min-h-16 items-center flex justify-between'}>
      <div className={'text-md font-light w-[60%]'}>{test.title}</div>
      <div className={'ml-auto flex w-[40%] justify-between'}>
          {
              test.label == "acceptable" || test.label == "Acceptable" ?
                  <div className={'w-[50%] flex justify-center'}>
                      <div className={'bg-green-50 text-green-500 rounded-md text-xl text-center ' +
                          'flex justify-left font-light border border-green-500 pr-1'}>
                          <CiCircleCheck className={'h-6 w-6 pt-1 text-green-500'}/>Acceptable
                      </div>
                  </div>:
                  <div className={'w-[50%] flex justify-center'}>
                      <div className={'bg-red-50 text-red-500 rounded-md text-xl text-center ' +
                          'flex justify-left font-light border border-red-500 pr-1'}>
                        <CiCircleRemove className={'h-6 w-6 pt-1 text-red-500'}/> Unacceptable
                      </div>
                  </div>
          }
          <div className={'w-[40%]'}>
              <Buttons test={test}/>
          </div>
      </div>
    </div>
  )
}

export default Row;