import React, { useEffect, useState, useRef } from "react";
import ReactModal from "react-modal";
import axios from "axios";
import Cookies from "js-cookie";
import { Editor } from "@tinymce/tinymce-react";
import Notiflix from "notiflix";
import { getUserCoordinates } from "../../helpers";

export default function CreateCommentModal({ updateTopic, topic_id }) {
	const [isOpen, setIsOpen] = useState(false);
	const editorRef = useRef(null);

	const [coordinates, setCoordinates] = useState([]);
	const [canSubmit, setCanSubmit] = useState(false);

	useEffect(() => {
		getUserCoordinates()
			.then((value) => {
				setCanSubmit(true);
				setCoordinates(value);
			})
			.catch((e) => {
				console.log(e);
			});
	}, []);

	function handleSubmit(event) {
		event.preventDefault();

		axios
			.post(
				"http://localhost:8080/api/comment/",
				{
					post_id: topic_id,
					content: editorRef.current.getContent(),
					coordinates: {
						city: coordinates.city,
						lat: coordinates.latitude,
						long: coordinates.longitude,
					},
				},
				{ headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
			)
			.then((response) => {
				Notiflix.Notify.success(`Comment created !`);
				updateTopic();
				closeModal();
			})
			.catch((error) => {
				Notiflix.Notify.failure(error.response.data);
			});
	}

	function openModal() {
		setIsOpen(true);
	}
	function closeModal() {
		setIsOpen(false);
	}

	return (
		<>
			<ReactModal
				isOpen={isOpen}
				ariaHideApp={false}
				shouldFocusAfterRender={true}
				preventScroll={true}
				onRequestClose={closeModal}
			>
				<form onSubmit={handleSubmit}>
					<h1>Create a comment</h1>
					<Editor
						onInit={(evt, editor) => (editorRef.current = editor)}
						initialValue=""
						init={{
							height: 500,
							menubar: false,
							plugins:
								"preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons",
							menubar: "file edit view insert format tools table help",
							toolbar:
								"undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl",
							content_style:
								"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
							toolbar_sticky: true,
						}}
					/>
				
                    <br />
                    <button class="button" type="submit" disabled={canSubmit ? false : true}>
						<div class="text-button">Comment !</div>
					</button>
				</form>
			</ReactModal>

			<i onClick={openModal} class="fa-regular fa-paper-plane fa-lg"></i>
		</>
	);
}
