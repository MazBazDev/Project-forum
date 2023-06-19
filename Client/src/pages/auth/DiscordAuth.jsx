import React, { useEffect, useState } from "react";
import axios from "axios";
import { Navigate } from "react-router-dom";
import Cookies from "js-cookie";
import Notiflix from "notiflix";

export default function HandleDiscordLogin() {
    function redirect() {
        const client_id = "1120336930433925240"
        const redirectUri = "http://localhost:3000/callback-discord"
        window.location.href=`https://discord.com/api/oauth2/authorize?client_id=${client_id}&redirect_uri=${redirectUri}&response_type=code&scope=identify%20email`
    } 

    return (
        <div class="textgithub" onClick={redirect}>CONNECT WITH DISCORD</div>
    );
}

export function DiscordCallcack() {
    const [logged, setLogged] = useState(false);

    useEffect(() => {
      const code = new URLSearchParams(window.location.search).get("code");
  
      function getAccessToken() {
        axios
          .post("http://localhost:8080/api/auth/discord", {
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