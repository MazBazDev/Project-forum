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
import Likes from "../../components/Like";

const ModalTopic = ({ topicId, closeModal, updateTopics }) => {
	const [topic, setTopic] = useState([]);
	const [isOppen, setIsOppen] = useState(false);

	useEffect(() => {
		refreshTopicDatas();
		viewTopic();
	}, []);

	function viewTopic() {
		axios.post(`http://localhost:8080/api/posts/view/${topicId}`);
	}

	function refreshTopicDatas() {
		axios
			.get(`http://localhost:8080/api/post/${topicId}`, {
				headers: { Authorization: `Bearer ${Cookies.get("token")}` },
			})
			.then((response) => {
				setTopic(response.data);
				setIsOppen(true); // Mettre à jour l'état isOppen ici
			});
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
								updateTopics();
								setIsOppen(false);
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
					<div id="container-all">
						<div id="container-buttonback">
							<div id="container-back">
								<i class="fa-solid fa-chevron-left fa-sm"></i>

								<div class="textback" onClick={closeModal}>
									Back
								</div>
							</div>
						</div>
						<h1 style={{ textAlign: "center" }}>{topic.title}</h1>
						<div id="container-alltopics">

							<div id="container-principaltopic">
								<div id="container-textprincipaltopic">
									<div
										class="textprincipaltopic"
										dangerouslySetInnerHTML={{ __html: topic.content }}
									/>
								</div>
								<div id="container-footerreply">
									<div id="footer-leftprincipaltopic">
										<UserProfile user={topic.user} />
										<div class="barre">|</div>
										<div class="date">{moment(topic.created_at).fromNow()}</div>
										<div class="barre">|</div>
										<div class="date">{topic.views != null ? topic.views.length : 0} view(s)</div>
										<div class="barre">|</div>
										<div class="date">{topic.likes != null ? topic.likes.length : 0} likes(s)</div>
										<div class="barre">|</div>
										<div class="date">
											{topic.categories != null &&
												topic.categories.map((elem) => {
													return <span> {elem.title}</span>;
												})}
										</div>
									</div>
									<div id="footer-rightprincipaltopic">
										<div id="container-heart">
											<Likes topic={topic} setTopic={setTopic} />
										</div>
										<div id="container-icon">
											<CreateCommentModal
												updateTopic={refreshTopicDatas}
												topic_id={topicId}
											/>
										</div>
									</div>
								</div>
							</div>
							{topic.comments != null &&
								topic.comments.map((elem) => {
									return (
										<Comment comment={elem} updateTopic={refreshTopicDatas} />
									);
								})}
						</div>
					</div>
				</>
			)}
		</ReactModal>
	);
};

export default ModalTopic;
