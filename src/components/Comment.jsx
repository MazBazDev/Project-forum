import React from "react";
import { GetUser } from "../helpers";
import UserProfile from "./UserProfile";
import moment from "moment";
import Notiflix from "notiflix";
import axios from "axios";
import Cookies from "js-cookie";

export default function Comment({ comment, updateTopic }) {
	function deleteComment() {
		Notiflix.Confirm.show(
			"Delete this comment ?",
			"Are you sure you want to delete this comment, this action is irreversible!",
			"Yes",
			"No",
			() => {
				axios
					.delete(`http://localhost:8080/api/comment/${comment.id}`, {
						headers: { Authorization: `Bearer ${Cookies.get("token")}` },
					})
					.then((response) => {
						Notiflix.Notify.success(`Comment deleted !`);
						updateTopic();
					})
					.catch((error) => {
						Notiflix.Notify.failure(error.response.data);
					});
			},
			{}
		);
	}
	return (
		<>
			<div id="container-secondtopic">
				<div id="container-textprincipaltopic">
					<div
						class="textprincipaltopic"
						dangerouslySetInnerHTML={{ __html: comment.content }}
					/>
				</div>
				<div id="container-footerreply">
					<div id="footer-leftprincipaltopic">
						<UserProfile user={comment.user} />
						<div class="barre">|</div>
						<div class="date">{comment.coordinates.city}</div>
						<div class="barre">|</div>
						<div class="date">{moment(comment.created_at).fromNow()}</div>
					</div>
				</div>
			</div>
		</>
	);
}
