import React from 'react';
import Navbar from './layouts/navbar';

class Layout extends React.Component {
  render() {
    const { children } = this.props;

    return (
      <div>
        <Navbar />
        {children}
      </div>
    );
  }
}

export default Layout;
