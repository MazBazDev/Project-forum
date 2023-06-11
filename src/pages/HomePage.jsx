import React from 'react';
import Layout from '../layouts.js';
import LocatedTopics from '../components/LocatedTopics';

class HomePage extends React.Component {
    render() {
        return (
            <Layout>
                <h1>Home Page</h1>
                <LocatedTopics/>
            </Layout>
        );
    }
}

export default HomePage;
