import React from 'react';
import Layout from '../layouts';

class NotFoundPage extends React.Component {
  render() {
    return (
      <Layout>
        <h1>404 - Page not found</h1>
        <p>The requested page could not be found.</p>
      </Layout>
    );
  }
}

export default NotFoundPage;
