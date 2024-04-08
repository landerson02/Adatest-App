import { BsTrash, BsFillTrashFill } from "react-icons/bs";
import { IoIosCheckmarkCircleOutline, IoIosCheckmarkCircle } from "react-icons/io";
import { IoCloseCircleOutline, IoCloseCircle } from "react-icons/io5";

import { TestDecisionsContext } from "@/lib/TestContext";
import { testType } from "@/lib/Types";
import { useContext, useState } from "react";

type ButtonsProps = {
  test: testType;
  currentTopic: string;
  setCurrentTopic: (topic: string) => void;
}

const Buttons = ({ test, currentTopic, setCurrentTopic }: ButtonsProps) => {
  // Load in test decisions context
  const { testDecisions, setTestDecisions } = useContext(TestDecisionsContext);

  // decision for the current test
  const [decision, setDecision] = useState<string>('');


  // When a test is approved, add it to the approved list of the current topic
  // and remove it from the denied and trashed lists
  const handleApprove = () => {
    if (decision === 'approve') return;
    if (currentTopic == 'PE') {
      let oldApproved = testDecisions.PE.approved;
      oldApproved.push(test);
      setTestDecisions({ ...testDecisions, PE: { ...testDecisions.PE, approved: oldApproved } });
      let oldDenied = testDecisions.PE.denied;
      let oldTrashed = testDecisions.PE.trashed;
      oldDenied = oldDenied.filter((t: testType) => t !== test);
      oldTrashed = oldTrashed.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, PE: { ...testDecisions.PE, denied: oldDenied, trashed: oldTrashed } });
      setDecision('approve');
    } else if (currentTopic == 'KE') {
      let oldApproved = testDecisions.KE.approved;
      oldApproved.push(test);
      setTestDecisions({ ...testDecisions, KE: { ...testDecisions.KE, approved: oldApproved } });
      let oldDenied = testDecisions.KE.denied;
      let oldTrashed = testDecisions.KE.trashed;
      oldDenied = oldDenied.filter((t: testType) => t !== test);
      oldTrashed = oldTrashed.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, KE: { ...testDecisions.KE, denied: oldDenied, trashed: oldTrashed } });
      setDecision('approve');
    } else if (currentTopic == 'LCE') {
      let oldApproved = testDecisions.LCE.approved;
      oldApproved.push(test);
      setTestDecisions({ ...testDecisions, LCE: { ...testDecisions.LCE, approved: oldApproved } });
      let oldDenied = testDecisions.LCE.denied;
      let oldTrashed = testDecisions.LCE.trashed;
      oldDenied = oldDenied.filter((t: testType) => t !== test);
      oldTrashed = oldTrashed.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, LCE: { ...testDecisions.LCE, denied: oldDenied, trashed: oldTrashed } });
      setDecision('approve');
    } else {
      throw new Error('Invalid topic');
    }
  }

  // When a test is denied, add it to the denied list of the current topic
  // and remove it from the approved and trashed lists
  const handleDeny = () => {
    if (decision === 'deny') return;
    if (currentTopic == 'PE') {
      let oldDenied = testDecisions.PE.denied;
      oldDenied.push(test);
      setTestDecisions({ ...testDecisions, PE: { ...testDecisions.PE, denied: oldDenied } });
      let oldApproved = testDecisions.PE.approved;
      let oldTrashed = testDecisions.PE.trashed;
      oldApproved = oldApproved.filter((t: testType) => t !== test);
      oldTrashed = oldTrashed.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, PE: { ...testDecisions.PE, approved: oldApproved, trashed: oldTrashed } });
      setDecision('deny');
    } else if (currentTopic == 'KE') {
      let oldDenied = testDecisions.KE.denied;
      oldDenied.push(test);
      setTestDecisions({ ...testDecisions, KE: { ...testDecisions.KE, denied: oldDenied } });
      let oldApproved = testDecisions.KE.approved;
      let oldTrashed = testDecisions.KE.trashed;
      oldApproved = oldApproved.filter((t: testType) => t !== test);
      oldTrashed = oldTrashed.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, KE: { ...testDecisions.KE, approved: oldApproved, trashed: oldTrashed } });
      setDecision('deny');
    } else if (currentTopic == 'LCE') {
      let oldDenied = testDecisions.LCE.denied;
      oldDenied.push(test);
      setTestDecisions({ ...testDecisions, LCE: { ...testDecisions.LCE, denied: oldDenied } });
      let oldApproved = testDecisions.LCE.approved;
      let oldTrashed = testDecisions.LCE.trashed;
      oldApproved = oldApproved.filter((t: testType) => t !== test);
      oldTrashed = oldTrashed.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, LCE: { ...testDecisions.LCE, approved: oldApproved, trashed: oldTrashed } });
      setDecision('deny');
    } else {
      throw new Error('Invalid topic');
    }
  }

  // When a test is trashed, add it to the trashed list of the current topic
  // and remove it from the approved and denied lists
  const handleTrash = () => {
    if (decision === 'trash') return;
    if (currentTopic == 'PE') {
      let oldTrashed = testDecisions.PE.trashed;
      oldTrashed.push(test);
      setTestDecisions({ ...testDecisions, PE: { ...testDecisions.PE, trashed: oldTrashed } });
      let oldApproved = testDecisions.PE.approved;
      let oldDenied = testDecisions.PE.denied;
      oldApproved = oldApproved.filter((t: testType) => t !== test);
      oldDenied = oldDenied.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, PE: { ...testDecisions.PE, approved: oldApproved, denied: oldDenied } });
      setDecision('trash');
    } else if (currentTopic == 'KE') {
      let oldTrashed = testDecisions.KE.trashed;
      oldTrashed.push(test);
      setTestDecisions({ ...testDecisions, KE: { ...testDecisions.KE, trashed: oldTrashed } });
      let oldApproved = testDecisions.KE.approved;
      let oldDenied = testDecisions.KE.denied;
      oldApproved = oldApproved.filter((t: testType) => t !== test);
      oldDenied = oldDenied.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, KE: { ...testDecisions.KE, approved: oldApproved, denied: oldDenied } });
      setDecision('trash');
    } else if (currentTopic == 'LCE') {
      let oldTrashed = testDecisions.LCE.trashed;
      oldTrashed.push(test);
      setTestDecisions({ ...testDecisions, LCE: { ...testDecisions.LCE, trashed: oldTrashed } });
      let oldApproved = testDecisions.LCE.approved;
      let oldDenied = testDecisions.LCE.denied;
      oldApproved = oldApproved.filter((t: testType) => t !== test);
      oldDenied = oldDenied.filter((t: testType) => t !== test);
      setTestDecisions({ ...testDecisions, LCE: { ...testDecisions.LCE, approved: oldApproved, denied: oldDenied } });
      setDecision('trash');
    } else {
      throw new Error('Invalid topic');
    }
  }

  return (
    <div className={'flex justify-between'}>
      <button className={'w-8 h-8'} onClick={handleApprove}>
        {decision === 'approve' ?
          <IoIosCheckmarkCircle className={'h-8 w-8 text-green-600 hover:scale-125'} /> :
          <IoIosCheckmarkCircleOutline className={'h-8 w-8 text-green-600 hover:scale-125'} />
        }
      </button>
      <button className={'w-8 h-8'} onClick={handleDeny}>
        {decision === 'deny' ?
          <IoCloseCircle className={'h-8 w-8 text-red-600 hover:scale-125'} /> :
          <IoCloseCircleOutline className={'h-8 w-8 text-red-600 hover:scale-125'} />
        }
      </button>
      <button className={'w-8 h-8'} onClick={handleTrash}>
        {decision === 'trash' ?
          <BsFillTrashFill className={'h-8 w-8 text-black hover:scale-125'} /> :
          <BsTrash className={'h-8 w-8 text-black hover:scale-125'} />
        }
      </button>
    </div>
  )
}

export default Buttons;
