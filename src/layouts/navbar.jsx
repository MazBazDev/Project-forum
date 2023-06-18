import React from 'react';
import { Link } from 'react-router-dom';
import NeedAuth from '../helpers.js';

class Navbar extends React.Component {
  render() {
    return (
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          
          <NeedAuth defaults={
          <li>
            <Link to="/login">Login</Link>
          </li>
          }/>

        <NeedAuth defaults={
          <li>
            <Link to="/register">Register</Link>
          </li>
          }/>

        <NeedAuth auth={
          <li>
            <Link to="/logout">Logout</Link>
          </li>
          }/>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
