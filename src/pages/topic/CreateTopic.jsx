import React , { useState, useEffect }from "react";
import CreateTopicModal from "./CreateTopicModal";

export default function CreateTopic({updateTopics}) {
    
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

    return (
        <>
            {isModalOpen && <CreateTopicModal onClose={closeModal} isModalOpen={isModalOpen}/>}
            <button onClick={openModal}>Create Topic</button>
        </>
      );
}
