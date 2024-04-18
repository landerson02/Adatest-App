import {generateTests} from "@/lib/Service";

type generateButtonProps = {
  onClickFunc: () => void
}

const GenerateButton = ({onClickFunc}: generateButtonProps) => {
  return (
    <button
      className={'w-24 h-8 bg-green-600 hover:bg-green-800' }
      onClick={onClickFunc}
    >Generate</button>
  )
}

export default GenerateButton;
