import React, { useState, useRef, useEffect } from "react";
import Input from "../../components/Input";
import { Editor } from "@tinymce/tinymce-react";
import Notiflix from "notiflix";
import axios from "axios";
import Cookies from "js-cookie";
import { getUserCoordinates } from "../../helpers";
import CategoriesInput from "../../components/CategoriesInput";
import ReactModal from "react-modal";

export default function CreateTopicModal({ onClose, isModalOpen }) {
  const editorRef = useRef(null);
  const [title, setTitle] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [canSubmit, setCanSubmit] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [isModalOpen]);

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

  function handleTitleChange(event) {
    setTitle(event.target.value);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (editorRef.current.getContent().length < 1 || title.length === 0 || selectedCategories.length === 0) {
      Notiflix.Notify.failure("You must fill all the fields!");
      return;
    }

    const categories = selectedCategories.map((category) => ({ id: category.value }));

    axios
      .post(
        "http://localhost:8080/api/post/",
        {
          title,
          content: editorRef.current.getContent(),
          coordinates: {
            city: coordinates.city,
            lat: coordinates.latitude,
            long: coordinates.longitude,
          },
          categories,
        },
        { headers: { Authorization: `Bearer ${Cookies.get("token")}` } }
      )
      .then((response) => {
        Notiflix.Notify.success(`Topic created!`);
        onClose();
      })
      .catch((error) => {
        Notiflix.Notify.failure(error.response.data);
      });
  }

  function handleCategoryChange(selectedValues) {
    setSelectedCategories(selectedValues);
  }

  return (
    <ReactModal isOpen={true} ariaHideApp={false} shouldFocusAfterRender={true} preventScroll={true} onRequestClose={onClose}>
      <form onSubmit={handleSubmit}>
        <h1>Create topic</h1>
        <br />
        <div id="container-input">
							<div class="title-input">Title</div>
              <Input id="title" placeholder="Title" name="title" className={"input-pseudo"} onChange={handleTitleChange} value={title} />
        <br />
        <br />

        </div>
        <Editor
          onInit={(evt, editor) => (editorRef.current = editor)}
          initialValue=""
          init={{
            height: 500,
            menubar: false,
            plugins: 'preview importcss searchreplace autolink autosave save directionality code visualblocks visualchars fullscreen image link media template codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons',
            menubar: 'file edit view insert format tools table help',
            toolbar: 'undo redo | bold italic underline strikethrough | fontfamily fontsize blocks | alignleft aligncenter alignright alignjustify | outdent indent |  numlist bullist | forecolor backcolor removeformat | pagebreak | charmap emoticons | fullscreen  preview save print | insertfile image media template link anchor codesample | ltr rtl',
            content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            toolbar_sticky: true,
          }}
        />
        <br />
        <p>Categories</p>
        <CategoriesInput selectedCategories={selectedCategories} onChange={handleCategoryChange} />
        <br />
        <button class="button" type="submit" disabled={!canSubmit}>
								<div class="text-button">
                Create topic!
								</div>
					</button>
      </form>
    </ReactModal>
  );
}
