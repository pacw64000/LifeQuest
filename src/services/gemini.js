import { GoogleGenAI } from "@google/genai";

// 1. Configuração inicial
const API_KEY = "AIzaSyAgmEkvuCjtLlBKWKnXnysk6xLCuTMkYts";
const ai = new GoogleGenAI({apiKey: API_KEY});

/**
 * Função para buscar missões personalizadas
 * @param {string} theme 
 */
export const fetchMissionsFromGemini = async (theme, dificuldade) => {
  const prompt = `
    Crie 1 missão desafiadora para um usuário fazer na vida real no tema ${theme}.
    ${dificuldade ? " Com a dificuldade " + dificuldade: ""}
    As missões devem ser realistas e motivadoras.
    
    Retorne os dados EXATAMENTE e unicamente neste formato JSON sem nenhum caracter extra:
    
    {
      "tituloMissao": "string",
      "descricaoMissao": "string",
      "segundosLembrete": number
      "dificuldadeMissao": "facil" | "media" | "dificil",
    }
  `;
  
  try {
    const response = await ai.models.generateContent({model: "gemma-4-31b-it", contents: prompt});
    
    const text = response.text;
    
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