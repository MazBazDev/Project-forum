import React, { useEffect, useState, useRef } from "react";
import ReactModal from "react-modal";
import axios from "axios";
import Cookies from "js-cookie";
import { Editor } from "@tinymce/tinymce-react";
import Notiflix from "notiflix";
import { getUserCoordinates } from "../../helpers";

export default function CreateCommentModal({updateTopic, topic_id}) {
    const [isOpen, setIsOpen] = useState(false);
	const editorRef = useRef(null);

    const [coordinates, setCoordinates] = useState([]);
	const [canSubmit, setCanSubmit] = useState(false);
	
    useEffect(() => {
		getUserCoordinates().then((value) => {
			setCanSubmit(true);
			setCoordinates(value);
		}).catch((e) => {
			console.log(e)
		})
  
	}, []);

    function handleSubmit(event) {
		event.preventDefault();

		axios
			.post("http://localhost:8080/api/comment/", {
                post_id : topic_id,
				content: editorRef.current.getContent(),
				coordinates : {
					city: coordinates.city,
					lat: coordinates.latitude,
					long:coordinates.longitude 
				}
			}, {headers: { Authorization: `Bearer ${Cookies.get("token")}` }})
			.then((response) => {
				Notiflix.Notify.success(`Comment created !`);
                updateTopic()
                closeModal()
			})
			.catch((error) => {
				Notiflix.Notify.failure(error.response.data);
			});
	}


    function openModal() {
        setIsOpen(true)
    }
    function closeModal() {
        setIsOpen(false)
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
                <button type="submit" disabled={canSubmit ? false: true}>Comment</button>
            </form>

        </ReactModal>
        <br/>
        <button onClick={openModal}>comment !</button>
        </>
    )
}