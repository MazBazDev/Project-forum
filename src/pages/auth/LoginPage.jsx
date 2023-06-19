import React , { useState } from "react";
import Layout from "../../layouts.js";
import Input from "../../components/Input";
import axios from "axios";
import Cookies from 'js-cookie'
import Notiflix from 'notiflix';
import { useNavigate } from "react-router-dom";
import HandleGithubLogin from "./GithubAuth.jsx";
import HandleDiscordLogin from "./DiscordAuth.jsx";

export default function LoginPage() {
  const navigate = useNavigate();

  const [datas, setDatas] = useState({
    email: "",
		pswd: "",
  })

	function handleSubmit(event) {
		event.preventDefault();

    axios.post('http://localhost:8080/api/auth/login', {
      email: datas.email,
      password: datas.pswd,
    })
      .then(response => {
        const token = response.data.token;
        Cookies.set('token', token, { expires: 7 }); // Le jeton expire dans 7 jours
        Cookies.set("user", JSON.stringify(response.data.user), {expires: 7});

        Notiflix.Notify.success(`Welcome back ${response.data.user.username} !`);
        
        navigate("/")
      })
      .catch(error => {
        Notiflix.Notify.failure(error.response.data);
      });
	};

	function handleChangeEmail(event) {
    setDatas({...datas, email : event.target.value })
	};
  
  function handleChangePassword(event) {
    setDatas({...datas, pswd : event.target.value })
	};

  return (
    <Layout>
      <h1>LoginPage</h1>
			<HandleGithubLogin/>
      <HandleDiscordLogin/>
      <form onSubmit={handleSubmit}>
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

        <button type="submit">Login</button>
      </form>
    </Layout>
  );
}
