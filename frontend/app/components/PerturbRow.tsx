import { perturbedTestType } from '@/lib/Types';
import { CiCircleCheck, CiCircleRemove } from 'react-icons/ci';


type PerturbRowProps = {
  pertTest: perturbedTestType
}

const PerturbRow = ({ pertTest }: PerturbRowProps) => {

  return (
    <div className={'w-full h-16 ml-4 flex items-center border-t border-r border-gray-500 bg-gray-50'}>
      {/* Checkbox Placeholder */}
      <div className={"w-[5%]"}>

      </div>
      {/* Test Essay */}
      <div className={'text-md font-light w-[55%] pl-2'}>
        {pertTest.title}
      </div>

      {/* AI Grade */}
      <div className={'w-[17%] items-center'}>
        {
          pertTest.label.toLowerCase() == "acceptable" ?
            <div className={'w-full flex justify-center'}>
              <div className={'bg-green-50 text-green-500 rounded-md text-center ' +
                'flex justify-left font-light border border-green-500 pr-1'}>
                <CiCircleCheck className={'h-6 w-6 pt-1 text-green-500'} />Acceptable
              </div>
            </div> :
            <div className={'w-full flex justify-center'}>
              <div className={'bg-red-50 text-red-500 rounded-md text-center ' +
                'flex justify-left font-light border border-red-500 pr-1'}>
                <CiCircleRemove className={'h-6 w-6 pt-1 text-red-500'} /> Unacceptable
              </div>
            </div>
        }
      </div>

      {/* Your Grade Placeholder */}
      <div className={'w-[13%]'}>

      </div>

      {/* Perturbation */}
      <div className={'w-[10%] text-center font-light'}>
        {pertTest.type[0].toUpperCase() + pertTest.type.slice(1).toLowerCase()}
      </div>
    </div>
  )
}

export default PerturbRow;

