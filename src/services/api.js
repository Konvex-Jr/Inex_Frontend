import axios from "axios";

const API_URL = "http://localhost:8000";

export const askQuestionFile = async (question, file, mentorType) => {
  try {
    const response = await axios.post(`${API_URL}/ask`, {
      question,
      file,
      mentorType,
      top_k: 3,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao fazer a pergunta:", error);
    return { answer: "Desculpe, ocorreu um erro ao processar sua pergunta." };
  }
};
export const askQuestion = async (question, mentorType) => {
  try {
    const response = await axios.post(`${API_URL}/ask`, {
      question,
      mentorType,
      top_k: 3,
    });

    return response.data;
  } catch (error) {
    console.error("Erro ao fazer a pergunta:", error);
    return { answer: "Desculpe, ocorreu um erro ao processar sua pergunta." };
  }
};
