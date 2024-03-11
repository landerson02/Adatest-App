import {testType} from "@/lib/Types";
import Row from "@/app/components/Row";

type testListProps = {
  tests: testType[]
}

const TestList = ({ tests } : testListProps) => {
  return (
    <div className={'w-full h-screen flex flex-col gap-2 overflow-y-scroll'}>
        <div className={'sticky top-0 border-black border-b-2 w-full max-h-12 min-h-12 items-center flex justify-between bg-gray-300'}>
          <div className={'text-xl w-[60%] text-center'}>AI Generated Test</div>
          <div className={'ml-auto flex w-[40%] justify-between pr-2'}>
            <div className={'text-xl w-[50%] flex justify-center'}>AI Grade</div>
            <div className={'text-xl w-[40%] flex justify-between'}>
              <p>Approve</p>
              <p>Deny</p>
              <p>Trash</p>
            </div>
          </div>
        </div>
      {tests && tests.map((test: testType, index: number) => {
        return <Row key={index} test={test}/>
        })}
    </div>
  );
}

export default TestList;
