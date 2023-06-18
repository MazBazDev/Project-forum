import React, { useEffect, useState } from "react";
import ReactModal from "react-modal";
import { GetUser } from "../../helpers";
import NeedAuth from "../../helpers";
import UserProfile from "../../components/UserProfile";
import moment from "moment";
import axios from "axios";
import Cookies from "js-cookie";
import CreateCommentModal from "./CreateCommentModal";
import Comment from "../../components/Comment";

const ModalTopic = ({ topicId, closeModal, onDelete }) => {
	const [topic, setTopic] = useState([]);
	const [isOppen, setIsOppen] = useState(false)

	

	useEffect(() => {
		refreshTopicDatas();
	}, [])

	function refreshTopicDatas() {
		axios.get(`http://localhost:8080/api/post/${topicId}`, {headers: { Authorization: `Bearer ${Cookies.get("token")}` }})
		.then((response) => {
			setTopic(response.data);
			setIsOppen(true); // Mettre à jour l'état isOppen ici
		})
	}

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
			isOpen={isOppen}
			contentLabel={`Topic numéro : ${topic.id}`}
			ariaHideApp={false}
			shouldFocusAfterRender={true}
			preventScroll={true}
			onRequestClose={closeModal}
		>
			{isOppen && ( // Vérifier si isOppen est vrai avant de rendre le contenu du modal
				<>
					<p>{`Topic numéro : ${topic.id}`}</p>
					<NeedAuth auth={<DeleteTopic />} />
					<div dangerouslySetInnerHTML={{ __html: topic.content }} />
					<UserProfile user={topic.user} />
					<span> {moment(topic.created_at).fromNow()}</span>
					<p>Categories: </p>
					{topic.categories.map((elem) => {
						return <span>{elem.title}</span>;
					})}
					<p>Commentaires</p>
					{topic.comments.map((elem) => {
						return (
							<Comment comment={elem} updateTopic={refreshTopicDatas}/>
						);
					})}

					<CreateCommentModal updateTopic={refreshTopicDatas} topic_id={topicId}/>
				</>
			)}
		</ReactModal>
	);
};

export default ModalTopic;
