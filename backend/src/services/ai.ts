import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import fs from "fs"; // Necessário para ler o arquivo
import mime from "mime-types"; // Necessário para saber o tipo do arquivo

dotenv.config();

if (!process.env.GEMINI_API_KEY) {
    throw new Error("❌ GEMINI_API_KEY ausente no .env");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Usando um modelo multimodal capaz de entender áudio e imagem
const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash", // O 1.5 Flash é excelente e rápido para áudio/imagem
    generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 2000,
    }
});

// Memória em RAM
const memory = new Map<string, string>();

const SYSTEM_PROMPT = `
IDENTIDADE: Você é a JÚLIA, assistente de triagem do escritório do Dr. José Lucas.
OBJETIVO: Acolher o cliente, entender o problema previdenciário e coletar dados básicos.

MULTIMODALIDADE:
- Se o cliente enviar ÁUDIO: Ouça com atenção, transcreva mentalmente o problema e responda como se tivesse lido um texto.
- Se o cliente enviar IMAGEM (documento): Agradeça o envio, diga que identificou o documento (ex: "Recebi sua identidade") e continue a triagem.

⚠️ REGRAS DE OURO:
1. Seja empática e simples. O cliente pode ser humilde.
2. Faça UMA pergunta por vez. Não sobrecarregue.
3. Se o cliente não souber responder, tranquilize-o e siga.

🚀 FLUXO:
1. Acolhimento ("Olá, tudo bem?").
2. Triagem (Idade, profissão, qual o problema com INSS).
3. Encerramento (Quando tiver dados suficientes).

🔴 GERAÇÃO DE RELATÓRIO E TICKET (CRÍTICO):
Quando você decidir encerrar o atendimento para passar ao humano, diga sua frase de despedida e, IMEDIATAMENTE DEPOIS, gere um bloco JSON oculto EXATAMENTE assim:

[REPORT_START]
{
  "cliente": "Nome Identificado",
  "tema": "LOAS / Aposentadoria / Auxílio",
  "interpretacao": "Resumo técnico do caso para o advogado ler (se foi áudio, resuma o que foi dito).",
  "atencao": "Se o cliente está bravo ou urgente",
  "sugestao": "Agendar consulta / Pedir documentos",
  "prioridade": "medium"
}
[REPORT_END]
`;

// Função auxiliar para converter arquivo local para o formato que o Gemini aceita
async function fileToGenerativePart(path: string, mimeType: string) {
    const fileData = await fs.promises.readFile(path);
    return {
      inlineData: {
        data: fileData.toString("base64"),
        mimeType,
      },
    };
}

// Função principal atualizada para aceitar mídia opcional
export const gerarResposta = async (msgUsuario: string, contactId: string, mediaPath?: string): Promise<string> => {
    try {
        let historico = memory.get(contactId) || "";
        
        // Monta o prompt base
        const promptParts: any[] = [
            SYSTEM_PROMPT,
            "\n\n--- HISTÓRICO RECENTE ---\n",
            historico,
            `\n\nCliente (Mensagem Atual): "${msgUsuario || '[Arquivo de Mídia enviado]'}"\n`
        ];

        // Se tiver mídia (áudio/imagem), adiciona ao prompt
        if (mediaPath) {
            const mimeType = mime.lookup(mediaPath) || 'application/octet-stream';
            const mediaPart = await fileToGenerativePart(mediaPath, mimeType);
            promptParts.push(mediaPart);
            promptParts.push("\n(O cliente enviou o arquivo acima. Analise-o junto com o texto.)\n");
        }

        promptParts.push("\nJúlia:");
        
        // Gera a resposta
        const result = await model.generateContent(promptParts);
        const respostaFull = result.response.text();

        // Salva na memória (limpando o JSON oculto)
        const textoLimpo = respostaFull.replace(/\[REPORT_START\][\s\S]*?\[REPORT_END\]/, "").trim();
        historico += `\nCliente: "${msgUsuario || '[Mídia]'}"\nJúlia: "${textoLimpo}"`;

        if (historico.length > 8000) historico = "..." + historico.slice(-7000);
        memory.set(contactId, historico);

        return respostaFull;
    } catch (error) {
        console.error("Erro AI Multimodal:", error);
        return "Desculpe, tive um problema técnico para processar sua mensagem (ou o arquivo). Pode tentar novamente em texto? 🙏";
    }
};