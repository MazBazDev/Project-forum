import React, { useState } from "react";
import Layout from "../../layouts.js";
import Input from "../../components/Input";
import axios from "axios";
import Cookies from "js-cookie";
import Notiflix from "notiflix";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
	const navigate = useNavigate();

	const [datas, setDatas] = useState({
		email: "",
		pswd: "",
		username: "",
	});

	function handleSubmit(event) {
		event.preventDefault();

		axios
			.post("http://localhost:8080/api/auth/register", {
				email: datas.email,
				password: datas.pswd,
				username: datas.username,
			})
			.then((response) => {
				const token = response.data.token;
				Cookies.set("token", token, { expires: 7 }); // Le jeton expire dans 7 jours
				Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });

				Notiflix.Notify.success(`Welcome ${response.data.user.username} !`);

				navigate("/");
			})
			.catch((error) => {
				Notiflix.Notify.failure(error.response.data);
			});
	}

	function handleChangeEmail(event) {
		setDatas({ ...datas, email: event.target.value });
	}

	function handleChangePassword(event) {
		setDatas({ ...datas, pswd: event.target.value });
	}
	function handleChangeUsername(event) {
		setDatas({ ...datas, username: event.target.value });
	}
	return (
		<Layout>
			<h1>Register</h1>
			<form onSubmit={handleSubmit}>
                <Input
					type="text"
					label="Username"
					placeholder="UserName"
					value={datas.username}
					onChange={handleChangeUsername}
					name="username"
				/>
				<Input
					type="text"
					label="Email"
					placeholder="email@email.com"
					value={datas.email}
					onChange={handleChangeEmail}
					name="email"
				/>

				<Input
					type="password"
					label="Password"
					placeholder="Enter your password"
					value={datas.pswd}
					onChange={handleChangePassword}
					name="pswd"
				/>

				<button type="submit">Register</button>
			</form>
		</Layout>
	);
}
