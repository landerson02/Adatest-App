import {generateTests} from "@/lib/Service";

type submitButtonProps = {
  onClickFunc: () => void
}

const SubmitButton = ({onClickFunc}: submitButtonProps) => {
  return (
    <button
      className={'w-32 h-10 rounded bg-green-600 hover:bg-green-800' }
      onClick={onClickFunc}
    >Submit</button>
  )
}

export default SubmitButton;
