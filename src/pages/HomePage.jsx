import React, { useEffect, useState } from "react";
import Layout from "../layouts.js";
import NeedAuth from "../helpers.js";
import CreateTopic from "./topic/CreateTopic.jsx";
import axios from "axios";
import Topic from "../../src/components/Topic";
import MapComponent from "../components/MapComponent.jsx";
import Filters from "../components/Filters.jsx";

function HomePage() {
	const [topics, setTopics] = useState([]);
	const [locatedTopics, setLocatedTopics] = useState([]);

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

	function goToLogin() {
		window.location.href = "/login";
	}

	return (
		<Layout>
			<div class="home">
				<div id="container-createtopic">
					<NeedAuth
						auth={<CreateTopic updateTopics={getTopics} />}
						defaults={
							<button onClick={goToLogin} class="create-new-topic">
								You need to be logged to create a topic :)
							</button>
						}
					/>
				</div>
				<div id="container-allhome">
					<div id="container-partileft">
						<div>
							<MapComponent
								topics={topics}
								locatedTopics={locatedTopics}
								setLocatedTopics={setLocatedTopics}
							/>
						</div>
					</div>
					<div id="container-partiright">
						<div id="container-topics">
							<div id="container-titletopics">
								<div class="titletopics">Topics at the location</div>
							</div>
							<div id="container-alltopics">
								{!locatedTopics || locatedTopics.length === 0 ? (
									<h2>Any topics!</h2>
								) : (
									<>
										<div className="filters">
											<Filters
												class="filters"
												locatedTopics={locatedTopics}
												setLocatedTopics={setLocatedTopics}
											/>
										</div>
										{locatedTopics.map((topic) => (
											<Topic key={topic} topic={topic} updateTopics={getTopics} />
										))}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</Layout>
	);
}

export default HomePage;
