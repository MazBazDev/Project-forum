import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";
import Input from "./Input";

export default function UserProfile({ user }) {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const openModal = () => {
		setIsModalOpen(true);
	};

	const closeModal = () => {
		setIsModalOpen(false);
	};

	useEffect(() => {
		if (isModalOpen) {
			document.body.classList.add("no-scroll");
		} else {
			document.body.classList.remove("no-scroll");
		}
	}, [isModalOpen]);

	return (
		<>
			<ReactModal
				isOpen={isModalOpen}
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
							<div class="pseudo">{user.username}</div>
							<img src={user.profile_picture} class="imgprofil" />
						</div>
					</div>
				</div>
			</ReactModal>


			<div id="container-user" onClick={openModal}>
				<img
					src={user.profile_picture}
					class="imgprofilfooter"
				/>
				<div class="username">{user.username}</div>
			</div>
		</>
	);
}
