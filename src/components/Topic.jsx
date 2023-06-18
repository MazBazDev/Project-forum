import React, { useState, useEffect } from "react";
import moment from "moment";
import ModalTopic from "../pages/topic/ModalTopic";
import { ProcessContent } from "../helpers";
const Topic = ({ topic , onDelete}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
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
      {isModalOpen && <ModalTopic topicId={topic.id} closeModal={closeModal} onDelete={onDelete}/>}

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
          <p>{ProcessContent(topic.content)}</p>
          <p>
            {topic.comments === null ? 0 : topic.comments.length} comment(s)
          </p>
          <p>
            <a>
              <img
                style={{ width: "50px" }}
                src={topic.user.profile_picture}
                alt="User Profile"
              />
              {topic.user.username}
            </a>{" "}
            | {timeAgo}
          </p>
        </div>
      </div>
    </>
  );
};

export default Topic;