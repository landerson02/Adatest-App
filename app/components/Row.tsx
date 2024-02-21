import {testType, createFakeTests} from "@/app/DummyTests";

type rowProps = {
  test: testType,
}

const Row = ({ test } : rowProps) => {
  return (
    <div className={'border-blue-800 border-2 w-full max-h-12 items-center flex'}>
      <div className={'text-3xl'}>{test.test}</div>

    </div>
  )
}

export default Row;