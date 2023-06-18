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
                        updateTopic()
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
			<hr />
			<div dangerouslySetInnerHTML={{ __html: comment.content }} />
			{comment.user.id == GetUser().id ? (
				<button onClick={deleteComment}>delete</button>
			) : ("")}
			<br />
			<UserProfile user={comment.user} />
			<span> | {comment.coordinates.city } | {moment(comment.created_at).fromNow()}</span>
		</>
	);
}
