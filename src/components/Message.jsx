import React from "react";
import "../App.css";

const Message = ({ text, isUser }) => {
  return (
    <div className={`message ${isUser ? "user-message" : "ai-message"}`}>
      <div className="message-content">{text}</div>
    </div>
  );
};

export default Message;
