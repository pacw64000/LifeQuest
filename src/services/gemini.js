import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Configuração inicial
const API_KEY = "AIzaSyB300lNaFLR6hgZ1JroonA0aBTkMqKXaL8";

const genAI = new GoogleGenerativeAI(API_KEY);

// 2. Definição do Modelo com Schema JSON forçado
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  },
});

/**
 * Função para buscar missões personalizadas
 * @param {string} theme 
 */
export const fetchMissionsFromGemini = async (theme, dificuldade) => {
  const prompt = `
    Crie 1 missão desafiadora para um usuário fazer na vida real no tema ${theme}.
    ${dificuldade ? " Com a dificuldade " + dificuldade: ""}
    As missões devem ser realistas e motivadoras.
    
    Retorne os dados EXATAMENTE neste formato JSON:
    
    {
      "tituloMissao": "string",
      "descricaoMissao": "string",
      "segundosLembrete": number
      "dificuldadeMissao": "facil" | "media" | "dificil",
    }
  `;
  
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro ao gerar missões no Gemini:", error);
    // Retorna um fallback amigável caso a API falhe
    return [
      {
        id: "1",
        titulo: "Missão de Backup",
        descricao: "Complete uma tarefa pendente hoje.",
        dificuldade: "Fácil"
      }
    ];
  }
};
