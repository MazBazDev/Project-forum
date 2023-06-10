import React from 'react';
import { Link } from 'react-router-dom';

class HomePage extends React.Component {
  render() {
    return (
      <>
        <h1>HomePage</h1>
        <Link to="/login">Login</Link>
      </>
    );
  }
}

export default HomePage;
