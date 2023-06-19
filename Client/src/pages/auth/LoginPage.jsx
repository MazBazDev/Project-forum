import React, { useState } from "react";
import Layout from "../../layouts.js";
import Input from "../../components/Input";
import axios from "axios";
import Cookies from "js-cookie";
import Notiflix from "notiflix";
import { useNavigate } from "react-router-dom";
import HandleGithubLogin from "./GithubAuth.jsx";
import HandleDiscordLogin from "./DiscordAuth.jsx";
import { Link } from "react-router-dom";

export default function LoginPage() {
	const navigate = useNavigate();

	const [datas, setDatas] = useState({
		email: "",
		pswd: "",
	});

	function handleSubmit(event) {
		event.preventDefault();

		axios
			.post("http://localhost:8080/api/auth/login", {
				email: datas.email,
				password: datas.pswd,
			})
			.then((response) => {
				const token = response.data.token;
				Cookies.set("token", token, { expires: 7 }); // Le jeton expire dans 7 jours
				Cookies.set("user", JSON.stringify(response.data.user), { expires: 7 });

				Notiflix.Notify.success(
					`Welcome back ${response.data.user.username} !`
				);

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

	return (
		<Layout>
			<div id="container-allcreate">
				<div id="container-create">
					<div id="container-textcreate">
						<div id="title-create">
							<div class="create">LOGIN</div>
						</div>
						<div id="container-input">
							<div class="title-input">E-mail</div>
							<Input
								type="text"
								placeholder="email@email.com"
								value={datas.email}
								onChange={handleChangeEmail}
								name="email"
								className={"input-pseudo"}
							/>
						</div>
						<div id="container-input">
							<div class="title-input">Password</div>
							<Input
								type="password"
								placeholder="Enter your password"
								value={datas.pswd}
								onChange={handleChangePassword}
								name="pswd"
								className={"input-pseudo"}
							/>
						</div>
						<div id="container-button">
							<button class="button" onClick={handleSubmit}>
								<div class="text-button" >
									CONNECT
								</div>
							</button>
						</div>
						<div id="container-buttoncreate">
							<div class="textcreate">
								<Link to="/register">Create an account !</Link>
							</div>
						</div>
					</div>
				</div>
				<div id="container-bar">
					<div class="bar"></div>
				</div>
				<div id="container-othercreate">
					<div id="container-creategithub">
						<div id="container-imggithub">
							<i class="fa-brands fa-github fa-2xl"></i>
						</div>
						<div id="container-textgithub">
							<HandleGithubLogin />
						</div>
					</div>
					<div id="container-creategithub">
						<div id="container-imggithub">
							<i class="fa-brands fa-discord fa-2xl"></i>
						</div>
						<div id="container-textgithub">
							<HandleDiscordLogin />
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}
