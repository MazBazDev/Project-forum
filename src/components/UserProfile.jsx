import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";

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
				<h1>{user.username}</h1>
                <img
					style={{ width: "50px" }}
					src={user.profile_picture}
					alt="User Profile"
				/>
			</ReactModal>
            
			<a onClick={openModal}>
				<img
					style={{ width: "50px" }}
					src={user.profile_picture}
					alt="User Profile"
				/>
				{user.username}
			</a>
		</>
	);
}
