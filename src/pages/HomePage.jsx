import React from 'react';
import Layout from '../layouts.js';
import NeedAuth from '../helpers.js';
import Topics from '../components/Topics';
import CreateTopic from './topic/CreateTopic.jsx';

class HomePage extends React.Component {
    render() {
        return (
            <Layout>
                <h1>Home Page</h1>
                <NeedAuth auth={<CreateTopic/>} defaults={<a href='/login'>You need to be logged</a>}/>
                 
                <Topics />
            </Layout>
        );
    }
}

export default HomePage;
