import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { BsTrash } from "react-icons/bs";
import { useTestContext } from "@/lib/TestContext";
import {testType} from "@/lib/Types";
import {useState} from "react";

type ButtonsProps = {
  test: testType;
}

const Buttons = ({ test }: ButtonsProps) => {
  const {
    setApprovedTests,
    setDeniedTests,
    setTrashedTests,
    approvedTests,
    deniedTests,
    trashedTests
  } = useTestContext();
  const [decision, setDecision] = useState<string>('');

  const handleApprove = () => {
    let oldApproved = approvedTests;
    oldApproved.push(test);
    setApprovedTests(oldApproved);
    let oldDenied = deniedTests;
    let oldTrashed = trashedTests;
    oldDenied = oldDenied.filter((t) => t !== test);
    oldTrashed = oldTrashed.filter((t) => t !== test);
    setDeniedTests(oldDenied);
    setTrashedTests(oldTrashed);
    setDecision('approve');
    console.log(approvedTests)
    console.log(deniedTests)
    console.log(trashedTests)
  }

  const handleDeny = () => {
    let oldDenied = deniedTests;
    oldDenied.push(test);
    setDeniedTests(oldDenied);
    let oldApproved = approvedTests;
    let oldTrashed = trashedTests;
    oldApproved = oldApproved.filter((t) => t !== test);
    oldTrashed = oldTrashed.filter((t) => t !== test);
    setApprovedTests(oldApproved);
    setTrashedTests(oldTrashed);
    setDecision('deny');
  }

  const handleTrash = () => {
    let oldTrashed = trashedTests;
    oldTrashed.push(test);
    setTrashedTests(oldTrashed);
    let oldApproved = approvedTests;
    let oldDenied = deniedTests;
    oldApproved = oldApproved.filter((t) => t !== test);
    oldDenied = oldDenied.filter((t) => t !== test);
    setApprovedTests(oldApproved);
    setDeniedTests(oldDenied);
    setDecision('trash');
  }


  return (
    <div className={'flex justify-between'}>
      <button className={'w-8 h-8'} onClick={handleApprove}>
        {decision == 'approve' ? <CiCircleCheck className={'h-8 w-8 text-black'}/> : <CiCircleCheck className={'h-8 w-8 text-green-600 hover:scale-125'}/>}
        {/*<CiCircleCheck className={'h-8 w-8 text-green-600 hover:scale-125'}/>*/}
      </button>
      <button className={'w-8 h-8'} onClick={handleDeny}>
        {decision == 'deny' ? <CiCircleRemove className={'h-8 w-8 text-black'}/> : <CiCircleRemove className={'h-8 w-8 text-red-600 hover:scale-125'}/>}
        {/*<CiCircleRemove className={'h-8 w-8 text-red-600 hover:scale-125'}/>*/}
      </button>
      <button className={'w-8 h-8'} onClick={handleTrash}>
        {decision == 'trash' ? <BsTrash className={'w-8 h-8 text-black'}/> : <BsTrash className={'w-8 h-8 text-red-600 hover:scale-125'}/>}
        {/*<BsTrash className={'w-8 h-8 text-red-600 hover:scale-125'}/>*/}
      </button>
    </div>
  )
}

export default Buttons;
