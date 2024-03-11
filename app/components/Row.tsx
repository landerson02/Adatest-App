import { testType } from "@/lib/Types";
import Buttons from "@/app/components/Buttons";

type rowProps = {
  test: testType,
}

const Row = ({ test } : rowProps) => {
  return (
    <div className={'border-gray-500 border-b-2 w-full min-h-16 items-center flex justify-between'}>
      <div className={'text-md font-light w-[60%]'}>{test.title}</div>
      <div className={'ml-auto flex w-[40%] justify-between'}>
        <div className={'text-xl w-[50%] flex justify-center text-center font-light'}>{test.label}</div>
        <div className={'w-[40%]'}>
          <Buttons test={test}/>
        </div>
      </div>
    </div>
  )
}

export default Row;