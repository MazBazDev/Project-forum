import React, { useState, useEffect } from "react";
import ReactModal from "react-modal";

const ModalTopic = ({ topic, closeModal }) => {
    return (
      <ReactModal
        isOpen={true}
        contentLabel={`Topic numéro : ${topic.id}`}
        ariaHideApp={false}
        shouldFocusAfterRender={true}
        preventScroll={true}
        onRequestClose={closeModal}
      >
        <p>{`Topic numéro : ${topic.id}`}</p>
        <div dangerouslySetInnerHTML={{ __html: topic.content }} />
      </ReactModal>
    );
  };
  
  export default ModalTopic;