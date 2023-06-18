import React, { useState, useEffect } from "react";
import moment from "moment";
import ModalTopic from "../pages/topic/ModalTopic";
import { ProcessContent, truncateString } from "../helpers";
const Topic = ({ topic , updateTopics}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    updateTopics()
    setIsModalOpen(false);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("no-scroll");
    } else {
      document.body.classList.remove("no-scroll");
    }
  }, [isModalOpen]);


  const timeAgo = moment(topic.created_at).fromNow();

  return (
    <>
      {isModalOpen && <ModalTopic topicId={topic.id} closeModal={closeModal} updateTopics={updateTopics}/>}

      <div onClick={openModal}>
        <hr
          style={{
            color: "#000000",
            backgroundColor: "#000000",
            height: 0.5,
            borderColor: "#000000",
          }}
        />
        <div key={topic.id}>
          <p>
            {topic.coordinates.city} - {topic.title}
          </p>
          <p>{truncateString(ProcessContent(topic.content), 90)}</p>
          <p>
            {topic.comments === null ? 0 : topic.comments.length} comment(s)
          </p>
          <p>{topic.views} view(s)</p>
          {topic.categories != null  && topic.categories.map((elem) => {
            return <span>{elem.title}</span>
          })}
          <p>
            <img
                style={{ width: "50px" }}
                src={topic.user.profile_picture}
                alt="User Profile"
              />
              {topic.user.username}
            | {timeAgo}
          </p>
        </div>
      </div>
    </>
  );
};

export default Topic;