import axios from "axios";
import Cookies from "js-cookie";
import React, { createRef, useCallback, useEffect, useState } from "react";
import ReactModal from "react-modal";
import { convertBase64 } from "../../helpers";
import Notiflix from "notiflix";
import Input from "../../components/Input";

export default function Profile() {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState({ username: "", email: "", profile_picture: "" });
  const [updatedUser, setUpdatedUser] = useState({ username: "", email: "", profile_picture: "" });
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
      method: 'POST',
      url: 'http://localhost:8080/api/me',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${Cookies.get("token")}`
      },
      data: updatedUser
    };
    
    axios.request(options).then((response) => {
      Cookies.set("token", response.data.token, { expires: 7 });
      getUser();
      Notiflix.Notify.success("Profile updated !")
    }).catch(function (error) {
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
    setUpdatedUser({...updatedUser, username: event.target.value})
  }
  function handleEmailChanges(event) {
    setUpdatedUser({...updatedUser, email: event.target.value})
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
        <h1>Hello {currentUser.username}</h1>
        <img style={{ width: "50px" }} src={updatedUser.profile_picture} alt="User Profile" />
        <input type="file" onChange={handleChange} ref={imageInputRef} accept="image/*" />
        <button onClick={clearImage} style={{ display: updatedUser.profile_picture != currentUser.profile_picture ? "block" : "none" }}>
          Clear image
        </button>

        <Input 
          label="Username"
          type="text"
          placeholder={currentUser.username}
          value={updatedUser.username}
          onChange={handleUsernameChanges}
          name="username"
        />

        <Input 
          label="Email"
          type="text"
          placeholder={currentUser.email}
          value={updatedUser.email}
          onChange={handleEmailChanges}
          name="email"
        />

        <hr/>
        <button type="submit" onClick={updateUser}>Save profile</button>
      </ReactModal>

      <p onClick={openModal}>Show Profile</p>
    </>
  );
}
