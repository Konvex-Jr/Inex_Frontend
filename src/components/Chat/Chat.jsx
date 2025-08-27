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
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [mentorType, setMentorType] = useState("generativo"); // "generativo" ou "reflexivo"

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
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
    if (!message.trim() && selectedFiles.length === 0) return;

    const userMessage = { 
      text: message, 
      isUser: true,
      files: selectedFiles.length > 0 ? [...selectedFiles] : []
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setShowWelcome(false);
    setIsLoading(true);

    try {
      // Se há arquivo anexado, inclui na pergunta
      let fullMessage = message;
      if (selectedFiles.length > 0) {
        const file = selectedFiles[0];
        fullMessage = `[Arquivo anexado: ${file.name}]\n\n${message}`;
      }
      
      const data = await askQuestion(fullMessage, file);
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
    if ((input.trim() || selectedFiles.length > 0) && !isLoading) {
      handleSendMessage(input);
      setInput("");
      setSelectedFiles([]); // Limpa os arquivos após o envio
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || selectedFiles.length > 0) && !isLoading) {
        handleSendMessage(input);
        setInput("");
        setSelectedFiles([]); // Limpa os arquivos após o envio
      }
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    
    // Limita a apenas 1 arquivo por vez
    if (files.length > 1) {
      alert("Por favor, selecione apenas 1 arquivo por vez.");
      return;
    }
    
    // Verifica se já existe um arquivo selecionado
    if (selectedFiles.length > 0) {
      alert("Você já tem um arquivo selecionado. Remova o arquivo atual antes de selecionar outro.");
      return;
    }
    
    // Valida o tamanho do arquivo (máximo 1MB)
    const maxSize = 1 * 1024 * 1024; // 1mb em bytes
    if (files[0].size > maxSize) {
      alert("O arquivo é muito grande. Tamanho máximo permitido: 1MB");
      return;
    }
    
    // Valida o tipo de arquivo (aceita apenas tipos comuns)
    const allowedTypes = [
      'text/plain',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];
    
    if (!allowedTypes.includes(files[0].type)) {
      alert("Tipo de arquivo não suportado. Tipos aceitos: texto, PDF, Word, imagens (JPEG, PNG, GIF, WebP)");
      return;
    }
    
    setSelectedFiles(files);
    
    // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const openFileSelector = () => {
    // Se já há um arquivo selecionado, pergunta se quer substituir
    if (selectedFiles.length > 0) {
      if (window.confirm("Você já tem um arquivo selecionado. Deseja substituí-lo?")) {
        setSelectedFiles([]);
        fileInputRef.current?.click();
      }
    } else {
      fileInputRef.current?.click();
    }
  };

  return (
    <>
      <div className="chat-container">
        <div className="chat-messages">
          {messages.length === 0 && !showWelcome ? (
            <div className="empty-message">
              Faça uma pergunta para começar...
            </div>
          ) : (
            <>
                          {messages.map((msg, index) => (
              <Message 
                key={index} 
                text={msg.text} 
                isUser={msg.isUser} 
                files={msg.files || []}
              />
            ))}
            {typingMessage && (
              <Message 
                text={typingMessage.text} 
                isUser={false} 
                files={[]}
              />
            )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <button
            type="button"
            className="mentor-icon-button"
            onClick={() => setMentorType(prev => prev === "generativo" ? "reflexivo" : "generativo")}
            title={`Mentor ${mentorType === "generativo" ? "Generativo" : "Reflexivo"} - Clique para alternar`}
            data-tooltip={`Mentor ${mentorType === "generativo" ? "Generativo" : "Reflexivo"}`}
          >
            {mentorType === "generativo" ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                fill="currentColor"
              >
                <path d="M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5-1.5 1.5-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16 6.5 6.5 0 0 1 3 9.5 6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14 14 12 14 9.5 12 5 9.5 5z"/>
              </svg>
            )}
          </button>

          <button
            type="button"
            className="file-attach-button"
            onClick={openFileSelector}
            title="Anexar arquivo (máximo 1 arquivo por vez)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="currentColor"
            >
              <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
            </svg>
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

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

          <div className="input-controls">
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
          </div>

          {selectedFiles.length > 0 && (
            <div className="selected-files">
              {selectedFiles.map((file, index) => (
                <div key={index} className="file-item">
                  <span className="file-name">{file.name}</span>
                  <button
                    type="button"
                    className="remove-file-button"
                    onClick={() => removeFile(index)}
                    title="Remover arquivo"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </>
  );
});

export default Chat;
