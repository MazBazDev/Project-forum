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

        <div id="container-principaltopic" onClick={openModal}>
						<div id="container-headerprincipaltopic">
							<div id="container-rightheader">
								<div class="rightheader">{topic.coordinates.city} - {topic.title}</div>
							</div>
							<div id="container-leftheader">
								<i class="fa-regular fa-comments fa-xl"></i>
								<div class="nb">{topic.comments === null ? 0 : topic.comments.length}</div>
							</div>
						</div>
						<div id="container-textprincipaltopic">
							<div class="textprincipaltopic">
              {truncateString(ProcessContent(topic.content), 90)}
							</div>
						</div>
						<div id="container-footerreply">
							<div id="footer-leftprincipaltopic">
								<a id="container-user">
									<img
										src={topic.user.profile_picture}
										class="imgprofilfooter"
									/>
									<div class="username">{topic.user.username}</div>
								</a>
								<div class="barre">| </div>
								<div class="date">{moment(topic.created_at).fromNow()}</div>
							</div>
						</div>
				</div>
    </>
  );
};

export default Topic;