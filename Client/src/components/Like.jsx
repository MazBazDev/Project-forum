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
		<i onClick={handleLike} style={{ color: userHasLiked ? "red" : "black" }} class="fa-regular fa-heart fa-xl" id="heart"></i>
	);
}
