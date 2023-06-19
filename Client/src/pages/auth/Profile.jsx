import axios from "axios";
import Cookies from "js-cookie";
import React, { createRef, useCallback, useEffect, useState } from "react";
import ReactModal from "react-modal";
import { convertBase64 } from "../../helpers";
import Notiflix from "notiflix";
import Input from "../../components/Input";

export default function Profile({ src }) {
	const [modalIsOpen, setModalIsOpen] = useState(false);
	const [currentUser, setCurrentUser] = useState({
		username: "",
		email: "",
		profile_picture: "",
	});
	const [updatedUser, setUpdatedUser] = useState({
		username: "",
		email: "",
		profile_picture: "",
	});
	const imageInputRef = createRef();

	useEffect(() => {
		getUser();
	}, []);

	function getUser() {
		axios
			.get("http://localhost:8080/api/me", {
				headers: { Authorization: `Bearer ${Cookies.get("token")}` },
			})
			.then((response) => {
				setCurrentUser(response.data);
				setUpdatedUser(response.data);
				Cookies.set("user", JSON.stringify(response.data), { expires: 7 });
			});
	}

	function updateUser() {
		const options = {
			method: "POST",
			url: "http://localhost:8080/api/me",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${Cookies.get("token")}`,
			},
			data: updatedUser,
		};

		axios
			.request(options)
			.then((response) => {
				Cookies.set("token", response.data.token, { expires: 7 });
				getUser();
				Notiflix.Notify.success("Profile updated !");
			})
			.catch(function (error) {
				console.error(error);
			});
	}

	const openModal = useCallback(() => {
		setModalIsOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setModalIsOpen(false);
	}, []);

	const handleChange = async (e) => {
		const profile_picture = await convertBase64(e.target.files[0]);
		setUpdatedUser({ ...updatedUser, profile_picture });
	};

	const clearImage = () => {
		const { profile_picture } = currentUser;
		setUpdatedUser({ ...updatedUser, profile_picture });
		imageInputRef.current.value = null;
	};

	function handleUsernameChanges(event) {
		setUpdatedUser({ ...updatedUser, username: event.target.value });
	}
	function handleEmailChanges(event) {
		setUpdatedUser({ ...updatedUser, email: event.target.value });
	}

	function logout() {
		window.location.href="/logout"
	}
	return (
		<>
			<ReactModal
				isOpen={modalIsOpen}
				ariaHideApp={false}
				shouldFocusAfterRender={true}
				preventScroll={true}
				onRequestClose={closeModal}
			>
				<div id="container-all">
					<div id="container-buttonback">
						<div id="container-back">
							<i class="fa-solid fa-chevron-left fa-sm"></i>

							<div class="textback" onClick={closeModal}>
								Back
							</div>
						</div>
					</div>
					<div id="container-pseudo">
						<div id="container-firstligne">
							<div class="pseudo">{currentUser.username}</div>
							<img src={updatedUser.profile_picture} class="imgprofil" />
							<div id="container-edit" style={{ display: updatedUser.profile_picture != currentUser.profile_picture ? "block" : "none" }}>
								
								<div class="edit" onClick={clearImage}><i class="fa-solid fa-trash fa-lg"></i> Clear picture</div>
							</div>
						</div>
						<div id="container-secondligne">
							<div id="container-lignepseudo">
								<div class="textinput">Pseudo</div>
								<Input
									type="text"
									placeholder={currentUser.username}
									value={updatedUser.username}
									onChange={handleUsernameChanges}
									name="username"
									className="input-lignepseudo"
								/>
							</div>
							<div id="container-ligneemail">
								<div class="textinput">Email</div>
								<Input
									type="text"
									placeholder={currentUser.email}
									value={updatedUser.email}
									onChange={handleEmailChanges}
									name="email"
									className="input-ligneemail"
								/>
							</div>
							<div id="container-ligneemail">
								<div class="textinput">Profile picture</div>
								<input
									type="file"
									onChange={handleChange}
									ref={imageInputRef}
									accept="image/*"
									class="input-ligneemail"
								/>
							</div>
							<div id="container-button">
								<div id="container-buttonconfirm">
									<div class="confirmbutton">
										<div class="textconfirm" onClick={updateUser}>
											CONFIRM
										</div>
									</div>
								</div>
								<div id="container-buttonconfirm">
									<div class="confirmbutton">
										<div class="textconfirm" onClick={logout}>
											LOGOUT
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</ReactModal>

			<img onClick={openModal} src={src} alt="" />
		</>
	);
}
