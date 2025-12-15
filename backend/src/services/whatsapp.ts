import makeWASocket, { useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import { prisma } from './prisma'; 
import { gerarResposta } from './ai';
import qrcode from 'qrcode-terminal'; // <--- BIBLIOTECA NOVA IMPORTADA

let sock: any; 

export const getSocket = () => sock;

export const startWhatsApp = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('./auth_baileys');

    sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // <--- DESATIVADO (Depreciado)
        defaultQueryTimeoutMs: undefined,
        browser: ["OmniDesk", "Chrome", "1.0.0"] // Identificação do navegador
    });

    sock.ev.on('creds.update', saveCreds);

    // --- NOVA LÓGICA DE CONEXÃO E QR CODE ---
    sock.ev.on('connection.update', (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        // Se receber um QR Code, desenha no terminal
        if (qr) {
            console.log("📲 ESCANEIE O QR CODE ABAIXO:");
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('❌ Conexão fechada. Reconectando...', shouldReconnect ? 'Sim' : 'Não');
            if (shouldReconnect) startWhatsApp();
        } else if (connection === 'open') {
            console.log('✅ WhatsApp Conectado com Sucesso!');
        }
    });

    sock.ev.on('messages.upsert', async ({ messages, type }: any) => {
        if (type !== 'notify') return;

        for (const msg of messages) {
            if (!msg.message || msg.key.fromMe) continue;

            const contactId = msg.key.remoteJid; 
            const content = msg.message.conversation || msg.message.extendedTextMessage?.text;

            if (!content) continue;

            // 1. Garante que contato existe
            const contact = await prisma.contact.upsert({
                where: { id: contactId },
                update: {},
                create: { 
                    id: contactId, 
                    name: msg.pushName || "Cliente Novo",
                    isAiActive: true 
                }
            });

            // 2. Salva msg do Cliente
            await prisma.message.create({
                data: {
                    contactId,
                    content,
                    fromMe: false
                }
            });

            // 3. Processamento da IA
            if (contact.isAiActive) {
                await sock.sendPresenceUpdate('composing', contactId);
                
                const respostaFull = await gerarResposta(content, contactId);
                
                
                const regexReport = /\[REPORT_START\]([\s\S]*?)\[REPORT_END\]/;
                const match = respostaFull.match(regexReport);
                
                let textoFinal = respostaFull;

                if (match) {
                    try {
                        const jsonStr = match[1];
                        const reportData = JSON.parse(jsonStr);
                        
                        // Cria Ticket Automaticamente
                        await prisma.ticket.create({
                            data: {
                                contactId,
                                title: reportData.tema || "Triagem Finalizada",
                                priority: reportData.prioridade || "medium",
                                status: "todo",
                                summary: reportData 
                            }
                        });
                        console.log("🎫 Ticket criado automaticamente!");

                        textoFinal = respostaFull.replace(regexReport, "").trim();

                    } catch (err) {
                        console.error("Erro ao processar JSON da IA", err);
                        textoFinal = respostaFull.replace(/\[REPORT_START\][\s\S]*?\[REPORT_END\]/, "").trim();
                    }
                }

                if (textoFinal) {
                    await sock.sendMessage(contactId, { text: textoFinal });
                    
                    await prisma.message.create({
                        data: {
                            contactId,
                            content: textoFinal,
                            fromMe: true,
                            isAi: true
                        }
                    });
                }
            }
        }
    });
};