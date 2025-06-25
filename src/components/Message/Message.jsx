import React from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import "./Message.css";

const Message = ({ text, isUser }) => {
  const html = DOMPurify.sanitize(marked(text));

  return (
    <div className={`message ${isUser ? "user-message" : "ai-message"}`}>
      <div
        className="message-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
};

export default Message;
