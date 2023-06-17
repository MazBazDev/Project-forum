import React, { useState, useRef, useEffect } from "react";
import Input from "../../components/Input";
import { Editor } from "@tinymce/tinymce-react";
import Notiflix from "notiflix";
import axios from "axios";
import {useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { getUserCoordinates } from "../../helpers";
import CustomSelect from "../../components/CategoriesInput";
import ReactModal from "react-modal";

export default function CreateTopicModal({onClose, isModalOpen}) {
    const navigate = useNavigate();
	const editorRef = useRef(null);
	const [title, setTitle] = useState("");
	const [coordinates, setCoordinates] = useState([]);
	const [canSubmit, setCanSubmit] = useState(false);
	
	useEffect(() => {
		if (isModalOpen) {
		  document.body.classList.add("no-scroll");
		} else {
		  document.body.classList.remove("no-scroll");
		}
	  }, [isModalOpen]);
	

	  
	useEffect(() => {
		getUserCoordinates().then((value) => {
			setCanSubmit(true);
			setCoordinates(value);
		}).catch((e) => {
			console.log(e)
		})
  
	}, []);

	function handleTitleChange(event) {
		setTitle(event.target.value);
	}

	function handleSubmit(event) {
		event.preventDefault();
		if (editorRef.current.getContent().length < 1 || title.length == 0) {
			Notiflix.Notify.failure("You must fill all the fields !");
		}

		axios
			.post("http://localhost:8080/api/post/", {
				title,
				content: editorRef.current.getContent(),
				coordinates : {
					city: coordinates.city,
					lat: coordinates.latitude,
					long:coordinates.longitude 
				}
			}, {headers: { Authorization: `Bearer ${Cookies.get("token")}` }})
			.then((response) => {
				Notiflix.Notify.success(`Topic created !`);

				navigate("/");
			})
			.catch((error) => {
				Notiflix.Notify.failure(error.response.data);
			});
	}

	return (
		<ReactModal
			isOpen={true}
			ariaHideApp={false}
			shouldFocusAfterRender={true}
			preventScroll={true}
			onRequestClose={onClose}
		>
			<form onSubmit={handleSubmit}>
					<h1>Create topic</h1>
					<Input
						label="Title"
						id="title"
						placeholder="Title"
						name="title"
						onChange={handleTitleChange}
						value={title}
					/>
					<Editor
						onInit={(evt, editor) => (editorRef.current = editor)}
						initialValue=""
						init={{
							height: 500,
							menubar: false,
							plugins: [
								"advlist autolink lists link image charmap print preview anchor",
								"searchreplace visualblocks code fullscreen",
								"insertdatetime media table paste code help wordcount",
							],
							toolbar:
								"undo redo | formatselect | " +
								"bold italic backcolor | alignleft aligncenter " +
								"alignright alignjustify | bullist numlist outdent indent | " +
								"removeformat | help",
							content_style:
								"body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
						}}
					/>
					<CustomSelect/>
					<button type="submit" disabled={canSubmit ? false: true}>Create topic !</button>
				</form>
		</ReactModal>
	
	);
}