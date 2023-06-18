import React, { useEffect, useState } from "react";
import Layout from "../layouts.js";
import NeedAuth from "../helpers.js";
import CreateTopic from "./topic/CreateTopic.jsx";
import axios from "axios";
import Topic from "../../src/components/Topic";

function HomePage() {
	const [topics, setTopics] = useState([]);

	useEffect(() => {
		getTopics();
	}, []);

	const getTopics = () => {
		axios
			.get("http://localhost:8080/api/posts")
			.then((response) => {
				setTopics(response.data.posts);
			})
			.catch((error) => {
				console.error(error);
			});
	};

	return (
		<Layout>
			<h1>Home Page</h1>
			<NeedAuth
				auth={<CreateTopic updateTopics={getTopics} />}
				defaults={<a href="/login">You need to be logged</a>}
			/>

			<div>
				{!topics || topics.length === 0 ? (
					<h2>Any topics!</h2>
				) : (
					topics.map((topic) => (
						<Topic key={topic} topic={topic} updateTopics={getTopics} />
					))
				)}
			</div>
		</Layout>
	);
}

export default HomePage;
