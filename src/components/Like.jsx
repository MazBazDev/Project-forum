import React from "react";
import { GetUser } from "../helpers";
import axios from "axios";
import Cookies from "js-cookie";
import Notiflix from "notiflix";

export default function Likes({ topic, setTopic }) {
	const userId = GetUser().id;
	const userHasLiked =
		topic.likes && topic.likes.some((like) => like.user === userId);

	function handleLike() {
		axios.post(`http://localhost:8080/api/post/${topic.id}/like`, {}, {
				headers: { Authorization: `Bearer ${Cookies.get("token")}` },
			})
			.then((response) => {
				setTopic(response.data);
			})
			.catch((error) => {
				Notiflix.Notify.failure(error.response.data);
			});
	}

	return (
		<>
			<p>{topic.likes != null ? topic.likes.length : 0} likes</p>
			<button
				style={{ backgroundColor: userHasLiked ? "red" : "transparent" }}
				onClick={handleLike}
			>
				Like !
			</button>
		</>
	);
}
