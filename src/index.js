import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import RegisterPage from './pages/auth/RegisterPage';
import Cookies from 'js-cookie';
import Notiflix from 'notiflix';

const isAuthenticated = () => {
  const token = Cookies.get("token");
  return !!token;
};

const PrivateRoute = ({ element, path }) => {
  useEffect(() => {
    if (isAuthenticated() && (path === '/login' || path === '/register')) {
      Notiflix.Notify.failure("You cannot access this page :/");
    }
  }, [path]);

  if (isAuthenticated() && (path === '/login' || path === '/register')) {
    return <Navigate to="/" />;
  } else {
    return element;
  }
};

ReactDOM.render(
  <React.StrictMode>
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<PrivateRoute element={<LoginPage />} path="/login" />} />
        <Route path="/register" element={<PrivateRoute element={<RegisterPage />} path="/register" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);
