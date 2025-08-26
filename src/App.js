import React, { useState, useRef } from "react";
import Chat from "./components/Chat/Chat";
import "./App.css";

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const chatRef = useRef(null);

  const handleQuestionClick = (question) => {
    setShowWelcome(false);

    setTimeout(() => {
      if (chatRef.current) {
        chatRef.current.sendMessage(question);
      }
    }, 0);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo-container">
          <h1>InExIA</h1>
        </div>
        <p className="subtitle">Onde a transformação interior encontra a inteligência artificial</p>
      </header>

      <main className="app-main">
        {showWelcome && (
          <div className="welcome-section">
            <h2>Como posso ajudar você hoje?</h2>
            <div className="suggested-questions">
              <button
                className="question-card"
                onClick={() =>
                  handleQuestionClick("O que são os Objetivos de Desenvolvimento Sustentável (ODS)?")
                }
              >
                <strong>O que são os Objetivos de Desenvolvimento Sustentável (ODS)?</strong>
              </button>
              <button
                className="question-card"
                onClick={() =>
                  handleQuestionClick("Como os IDGs podem contribuir para os ODS?")
                }
              >
                <strong>Como os IDGs podem contribuir para os ODS?</strong>
              </button>
              <button
                className="question-card"
                onClick={() =>
                  handleQuestionClick("Quais são os principais desafios para implementar os ODS?")
                }
              >
                <strong>Quais são os principais desafios para implementar os ODS?</strong>
              </button>
              <button
                className="question-card"
                onClick={() =>
                  handleQuestionClick("Qual a relação entre IDG e sustentabilidade?")
                }
              >
                <strong>Qual a relação entre IDG e sustentabilidade?</strong>
              </button>
            </div>
          </div>
        )}
        <Chat
          ref={chatRef}
          showWelcome={showWelcome}
          setShowWelcome={setShowWelcome}
        />
      </main>
    </div>
  );
}

export default App;
