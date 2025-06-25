import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import Message from "../Message/Message";
import { askQuestion } from "../../services/api";
import "./Chat.css";

const Chat = forwardRef(({ showWelcome, setShowWelcome }, ref) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState(null);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const cancelTypingRef = useRef(false);

  useImperativeHandle(ref, () => ({
    sendMessage: (message) => {
      handleSendMessage(message);
    },
  }));

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, 200);
      textareaRef.current.style.height = `${newHeight}px`;

      if (newHeight >= 200) {
        textareaRef.current.style.overflowY = "auto";
      } else {
        textareaRef.current.style.overflowY = "hidden";
      }
    }
  }, [input]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingMessage]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    const userMessage = { text: message, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setShowWelcome(false);
    setIsLoading(true);

    try {
      const data = await askQuestion(message);
      cancelTypingRef.current = false;
      setTypingMessage({ fullText: data.answer, text: "", isUser: false });
    } catch (error) {
      console.error("Erro ao fazer a pergunta:", error);
      const errorMessage = {
        text: "Erro ao obter resposta. Tente novamente mais tarde.",
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleCancelTyping = () => {
    cancelTypingRef.current = true;
  };

  useEffect(() => {
    if (!typingMessage) return;

    if (cancelTypingRef.current) {
      cancelTypingRef.current = false;
      setTypingMessage(null);
      setIsLoading(false);
      setMessages((prev) => [
        ...prev,
        {
          text: typingMessage.text + " \n\n_Resposta interrompida._",
          isUser: false,
        },
      ]);
      return;
    }

    if (typingMessage.text === typingMessage.fullText) {
      setMessages((prev) => [...prev, { ...typingMessage }]);
      setTypingMessage(null);
      setIsLoading(false);
    } else {
      const nextCharIndex = typingMessage.text.length;
      const nextChar = typingMessage.fullText[nextCharIndex];

      const timeout = setTimeout(() => {
        setTypingMessage((prev) => ({
          ...prev,
          text: prev.text + nextChar,
        }));
      }, 3);

      return () => clearTimeout(timeout);
    }
  }, [typingMessage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      handleSendMessage(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isLoading) {
        handleSendMessage(input);
        setInput("");
      }
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 && !showWelcome ? (
          <div className="empty-message">
            Faça uma pergunta para começar...
          </div>
        ) : (
          <>
            {messages.map((msg, index) => (
              <Message key={index} text={msg.text} isUser={msg.isUser} />
            ))}
            {typingMessage && (
              <Message text={typingMessage.text} isUser={false} />
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => {
            if (e.target.value.length <= 2000) setInput(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Envie uma mensagem..."
          className="chat-input"
          disabled={isLoading}
          rows={1}
        />
        <div className="token-counter">{input.length}/2000</div>

        {typingMessage ? (
          <button
            type="button"
            className="chat-button cancel-button"
            onClick={handleCancelTyping}
            title="Cancelar resposta"
          >
            ■
          </button>
        ) : (
          <button
            type="submit"
            className="chat-button"
            disabled={isLoading || !input.trim() || input.length > 2000}
            title="Enviar mensagem"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
              >
                <path
                  fill="white"
                  d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"
                ></path>
              </svg>
            )}
          </button>
        )}
      </form>
    </div>
  );
});

export default Chat;
