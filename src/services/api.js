import axios from "axios";

const API_URL = "http://localhost:8000";

export const askQuestion = async (question, mentorType, file = null) => {
  try {
    const payload = {
      question,
      mentorType,
      top_k: 3,
    };

    if (file){
      payload.file = file;
    }

    const response = await axios.post(`${API_URL}/ask`, payload);

    return response.data;
  } catch (error) {
    console.error("Erro ao fazer a pergunta:", error);
    return { answer: "Desculpe, ocorreu um erro ao processar sua pergunta." };
  }
};
