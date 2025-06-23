const API_URL = "http://localhost:8000";

export const askQuestion = async (question) => {
  try {
    const response = await fetch(`${API_URL}/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        top_k: 3,
      }),
    });

    if (!response.ok) {
      throw new Error("Erro na resposta da API");
    }

    return await response.json();
  } catch (error) {
    console.error("Erro ao fazer a pergunta:", error);
    return { answer: "Desculpe, ocorreu um erro ao processar sua pergunta." };
  }
};
