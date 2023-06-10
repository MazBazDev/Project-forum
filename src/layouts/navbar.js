import React from 'react';
import { Link } from 'react-router-dom';

class Navbar extends React.Component {
  render() {
    return (
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/login">Login</Link>
          </li>
          {/* Ajoutez d'autres liens de navigation ici */}
        </ul>
      </nav>
    );
  }
}

export default Navbar;
