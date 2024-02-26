import { CiCircleCheck, CiCircleRemove } from "react-icons/ci";
import { FcCancel } from "react-icons/fc";
import { IoCheckmarkCircle } from "react-icons/io5";


const Buttons = () => {
  return (
    <div className={'flex justify-between'}>
      <button className={'w-12'}><CiCircleCheck className={'h-[30px] w-[30px] text-green-600'}/></button>
      <button className={'w-12'}><CiCircleRemove className={'h-[30px] w-[30px] text-red-600'}/></button>
      <button className={'w-12'}><FcCancel className={'h-[30px] w-[30px] text-red-600'}/></button>
    </div>
  )
}

export default Buttons;
