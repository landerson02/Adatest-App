import {generateTests} from "@/lib/Service";

type submitButtonProps = {
  onClickFunc: () => void
}

const SubmitButton = ({onClickFunc}: submitButtonProps) => {
  return (
    <button
      className={'w-32 h-10 rounded-lg bg-green-600 border-2 border-green-800 hover:bg-green-800 text-white font-sans' }
      onClick={onClickFunc}
    >Submit</button>
  )
}

export default SubmitButton;
