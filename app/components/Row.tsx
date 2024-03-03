import { testType } from "@/lib/Types";
import Buttons from "@/app/components/Buttons";

type rowProps = {
  test: testType,
}

const Row = ({ test } : rowProps) => {
  return (
    <div className={'border-gray-500 border-b-2 w-full max-h-12 min-h-12 items-center flex justify-between'}>
      <div className={'text-md w-[65%]'}>{test.title}</div>
      <div className={'ml-auto flex w-[35%] justify-between'}>
        <div className={'text-xl w-[33%] self-center flex justify-center'}>
          {test.topic == '/__suggestions__' ? 'Suggestion' : test.topic}
        </div>
        <div className={'text-xl pr-8 w-[33%] flex justify-center'}>{test.label}</div>
        <div className={'w-[33%]'}>
          <Buttons test={test}/>
        </div>
      </div>
    </div>
  )
}

export default Row;