import ReactModal from "react-modal";
import { GetUser } from "../../helpers";

const ModalTopic = ({ topic, closeModal, onDelete }) => {
	const DeleteTopic = () => {
		if (topic.user.id == GetUser().id) {
      function Delete() {
        return onDelete(topic)
      }
			return <button onClick={Delete}>Delete topic</button>;
		}
	};

	return (
		<ReactModal
			isOpen={true}
			contentLabel={`Topic numéro : ${topic.id}`}
			ariaHideApp={false}
			shouldFocusAfterRender={true}
			preventScroll={true}
			onRequestClose={closeModal}
		>
			<p>{`Topic numéro : ${topic.id}`}</p>
			<DeleteTopic />
			<div dangerouslySetInnerHTML={{ __html: topic.content }} />
		</ReactModal>
	);
};

export default ModalTopic;
