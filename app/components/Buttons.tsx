import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { BsTrash } from "react-icons/bs";
import { useTestContext } from "@/lib/TestContext";
import {testType} from "@/lib/Types";

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
  }


  return (
    <div className={'flex justify-between'}>
      <button className={'w-8 h-8'} onClick={handleApprove}>
        <CiCircleCheck className={'h-8 w-8 text-green-600 hover:scale-125'}/>
      </button>
      <button className={'w-8 h-8'} onClick={handleDeny}>
        <CiCircleRemove className={'h-8 w-8 text-red-600 hover:scale-125'}/>
      </button>
      <button className={'w-8 h-8'} onClick={handleTrash}>
        <BsTrash className={'w-8 h-8 text-red-600 hover:scale-125'}/>
      </button>
    </div>
  )
}

export default Buttons;
