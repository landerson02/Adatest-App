import {testType, createFakeTests} from "@/app/DummyTests";
import Buttons from "@/app/components/Buttons";

type rowProps = {
  test: testType,
}

const Row = ({ test } : rowProps) => {
  return (
    <div className={'border-gray-500 border-b-2 w-full max-h-12 min-h-12 items-center flex justify-between'}>
      <div className={'text-md'}>{test.title}</div>
      <div className={'ml-auto flex w-[30%] justify-between'}>
        <div className={'text-xl w-[33%] self-center flex justify-center'}>{test.label}</div>
        <div className={'text-xl pr-8 w-[33%] flex justify-center'}>{test.label}</div>
        <Buttons/>
      </div>
    </div>
  )
}

export default Row;