import { IoIosClose } from 'react-icons/io';
import Modal from 'react-modal';

type PopupProps = {
  isOpen: boolean,
  closeModal: () => void,
  children?: React.ReactNode,
}

const Popup: React.FC<PopupProps> = ({ isOpen, closeModal, children }: PopupProps) => {

  const customStyles = {
    content: {
      width: '60%',
      height: '70%',
      maxHeight: '70%',
      margin: 'auto',
      padding: 0,
      backgroundColor: 'white',
      outline: 'solid 1px black',
    },
    // Darken BG when modal is open
    overlay: { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
  }

  return (
    <Modal
      style={customStyles}
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Modal"
      ariaHideApp={false}
    >
      {/* Close button */}
      <button onClick={closeModal} className={'absolute top-0 left-0 p-2 flex justify-center items-center w-12 h-12 z-10'}>
        <IoIosClose className={'text-red-600 w-full h-full z-10'} />
      </button>

      {children}
    </Modal>
  )
}

export default Popup;

