import React from 'react';
import Layout from '../layouts.js';
import { PrivateRoute, isAuthenticated } from '../index.js';
import NeedAuth from '../helpers.js';
import Topics from '../components/Topics';

class HomePage extends React.Component {
    createTopic() {
    }
    render() {
        return (
            <Layout>
                <h1>Home Page</h1>
                <NeedAuth auth={<a href="/topic/create">Create a topic</a>} defaults={<a href='/login'>You need to be logged</a>}/>
                <Topics />
            </Layout>
        );
    }
}

export default HomePage;
