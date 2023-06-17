import React , { useState, useEffect }from "react";
import CreateTopicModal from "./CreateTopicModal";

export default function CreateTopic() {
    
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

    return (
        <>
            {isModalOpen && <CreateTopicModal onClose={closeModal} isModalOpen={isModalOpen}/>}
            <p onClick={openModal}>Create Topic</p>
        </>
      );
}
