import React, { useEffect, useState } from "react";
import axios from "axios";
import Topic from "./Topic";
import Cookies from "js-cookie";
import Notiflix from "notiflix";
import { GetUser } from "../helpers";

const Topics = () => {
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

  const DeleteTopic = (topic) => {
      if (topic.user.id == GetUser().id) {
        Notiflix.Confirm.show(
					"Delete this topic?",
					"Are you sure you want to delete this topic, this action is irreversible!",
					"Yes",
					"No",
					() => {
						axios.delete(`http://localhost:8080/api/post/${topic.id}`, {headers: { Authorization: `Bearer ${Cookies.get("token")}` }})
            .then((response) => {
              Notiflix.Notify.success(`Topic deleted !`);
              
              setTopics((prevTopics) =>
                prevTopics.filter((atopic) => atopic.id !== topic.id)
              );
            })
            .catch((error) => {
              Notiflix.Notify.failure(error.response.data);
            });
					},
					{}
        );
			}
    }

  return (
    <div>
    {!topics || topics.length === 0 ? (
      <h2>Any topics!</h2>
    ) : (
      topics.map((topic) => (
        <Topic key={topic.id} topic={topic} onDelete={DeleteTopic} />
      ))
    )}
  </div>
  );
};

export default Topics;
