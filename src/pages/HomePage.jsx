import React from 'react';
import Layout from '../layouts.js';
import LocatedTopics from '../components/LocatedTopics';
import { PrivateRoute, isAuthenticated } from '../index.js';
import NeedAuth from '../helpers.js';

class HomePage extends React.Component {
    createTopic() {
    }
    render() {
        return (
            <Layout>
                <h1>Home Page</h1>
                <NeedAuth auth={<a href="/topic/create">Create a topic</a>} defaults={<a href='/login'>You need to be logged</a>}/>
                <LocatedTopics/>
            </Layout>
        );
    }
}

export default HomePage;
