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
import Notiflix from "notiflix";

const ModalTopic = ({ topicId, closeModal, updateTopics }) => {
	const [topic, setTopic] = useState([]);
	const [isOppen, setIsOppen] = useState(false)

	useEffect(() => {
		refreshTopicDatas();
		viewTopic();
	}, [])

	function viewTopic() {
		axios.post(`http://localhost:8080/api/posts/view/${topicId}`)
	}

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
				Notiflix.Confirm.show(
					"Delete this topic?",
					"Are you sure you want to delete this topic, this action is irreversible!",
					"Yes",
					"No",
					() => {
						axios
							.delete(`http://localhost:8080/api/post/${topic.id}`, {
								headers: { Authorization: `Bearer ${Cookies.get("token")}` },
							})
							.then((response) => {
								Notiflix.Notify.success(`Topic deleted !`);
								updateTopics()
								setIsOppen(false)
							})
							.catch((error) => {
								Notiflix.Notify.failure(error.response.data);
							});
					},
					{}
				);
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
					<p>{topic.views} view(s)</p>
					<p>Categories: </p>
					{topic.categories != null && topic.categories.map((elem) => {
						return <span>{elem.title}</span>
					})}
					<p>Commentaires</p>
					<CreateCommentModal updateTopic={refreshTopicDatas} topic_id={topicId}/>
					
					{topic.comments != null && topic.comments.map((elem) => {
						return (
							<Comment comment={elem} updateTopic={refreshTopicDatas}/>
						);
					})}

				</>
			)}
		</ReactModal>
	);
};

export default ModalTopic;
