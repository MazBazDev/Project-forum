import React from 'react';
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie'

class Navbar extends React.Component {
  render() {
    return (
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
            {Cookies.get("token")}
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          <li>
            <Link to="/register">Register</Link>
          </li>
          {/* Ajoutez d'autres liens de navigation ici */}
        </ul>
      </nav>
    );
  }
}

export default Navbar;
