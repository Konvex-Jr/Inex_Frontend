import React from "react";
import "./Message.css";
import DOMPurify from 'dompurify';

const Message = ({ text, isUser }) => {
  return (
    <div className={`message ${isUser ? "user-message" : "ai-message"}`}>
      <div
        className="message-content"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(text) }}
      />
    </div>
  );
};

export default Message;
