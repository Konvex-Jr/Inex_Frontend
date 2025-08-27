import React from "react";
import DOMPurify from "dompurify";
import { marked } from "marked";
import "./Message.css";

const Message = ({ text, isUser, files = [] }) => {
  const html = DOMPurify.sanitize(marked(text));

  return (
    <div className={`message ${isUser ? "user-message" : "ai-message"}`}>
      <div
        className="message-content"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      {/* Exibe arquivos anexados apenas para mensagens do usuário */}
      {isUser && files && files.length > 0 && (
        <div className="message-files">
          {files.map((file, index) => (
            <div key={index} className="message-file-item">
              <span className="message-file-icon">📎</span>
              <span className="message-file-name">{file.name}</span>
              <span className="message-file-size">
                ({(file.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Message;
