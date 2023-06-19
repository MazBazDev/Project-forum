import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/auth/RegisterPage';
import Cookies from 'js-cookie';
import Notiflix from 'notiflix';
import CreateTopicPage from './pages/topic/CreateTopicModal';
import { Callback, GithubCallback } from './pages/auth/GithubAuth';
import { DiscordCallcack } from './pages/auth/DiscordAuth';

export const isAuthenticated = () => {
  const token = Cookies.get("token");
  return !!token;
};

export const PrivateRoute = ({ element }) => {
  useEffect(() => {
    if (!isAuthenticated()) {
      Notiflix.Notify.failure("You need to be logged :/");
    }
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  } else {
    return element;
  }
};

const OnlyPublicRoute = ({ element }) => {
  useEffect(() => {
    if (isAuthenticated()) {
      Notiflix.Notify.failure("You cannot access this page :/");
    }
  }, []);

  if (isAuthenticated()) {
    return <Navigate to="/" />;
  } else {
    return element;
  }
};

const Logout = () => {
  Cookies.remove("token");
  return <Navigate to="/" />;
}

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/" element={<HomePage />} />

        <Route path="/login" element={<OnlyPublicRoute element={<LoginPage />} />}/>
        <Route path="/register" element={<OnlyPublicRoute element={<RegisterPage />} />} />
        <Route path="/callback-github" element={<GithubCallback/>} />
        <Route path="/callback-discord" element={<DiscordCallcack/>} />

        <Route path="/logout" element={<Logout/>} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

