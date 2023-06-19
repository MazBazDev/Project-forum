import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Notiflix from "notiflix";

export default function HandleGithubLogin() {
  function redirect() {
    const clientId = "d8136884ff4675d74c9a";
    const redirectUri = "http://localhost:3000/callback";
    window.location.href = `https://github.com/login/oauth/authorize?scope=user:email&client_id=${clientId}&redirect_uri=${redirectUri}`;
  }

  return (
    <div>
      <button onClick={redirect}>Se connecter avec GitHub</button>
    </div>
  );
}

export function GithubCallback() {
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("code");

    function getAccessToken() {
      axios
        .post("http://localhost:8080/api/auth/github", {
          code,
        })
        .then((response) => {
          console.log(response.data);
          const token = response.data.token;
          Cookies.set("token", token, { expires: 7 }); // Le jeton expire dans 7 jours
          Cookies.set("user", JSON.stringify(response.data.user), {
            expires: 7,
          });

          Notiflix.Notify.success(`Welcome back ${response.data.user.username}!`);

          setLogged(true);
        })
        .catch((error) => {
          Notiflix.Notify.failure(error.message);
        });
    }

    if (code) {
      getAccessToken();
    }
  }, []);

  if (logged) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <p>Authentification en cours...</p>
    </div>
  );
}
