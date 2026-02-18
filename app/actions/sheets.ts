
"use server";

import { google } from "googleapis";

const SHEET_ID = process.env.SHEET_NFS_NAO_CADASTRADAS_ID;
const API_KEY = process.env.SHEET_NFS_NAO_CADASTRADAS_API_KEY;
const CLIENT_EMAIL = process.env.SHEET_NFS_CLIENT_EMAIL;
const PRIVATE_KEY = process.env.SHEET_NFS_PRIVATE_KEY?.replace(/\\n/g, "\n");

export interface RecebimentoNF {
    row: number;
    nf: string;
    cliente: string;
    horasPendentes: number;
    status: string;
    cadastroTime?: number;
    horarioCadastro?: string; // Raw string from sheet
}

// Helper to get authenticated client
async function getSheetsClient() {
    if (!CLIENT_EMAIL || !PRIVATE_KEY) {
        throw new Error("Missing Service Account credentials");
    }

    const auth = new google.auth.GoogleAuth({
        credentials: {
            client_email: CLIENT_EMAIL,
            private_key: PRIVATE_KEY,
        },
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    return google.sheets({ version: "v4", auth });
}

export async function getRecebimentoData(): Promise<RecebimentoNF[]> {
    console.log("[Sheets] Iniciando busca de dados do Recebimento...");

    if (!SHEET_ID || !API_KEY) {
        console.error("[Sheets] Configuração ausente no .env");
        return [];
    }

    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A:Z?key=${API_KEY}`,
            { next: { revalidate: 10 } }
        );

        if (!response.ok) {
            console.error("[Sheets] Erro na API do Google Reader");
            return [];
        }

        const data = await response.json();
        const rows = data.values;

        if (!rows || rows.length < 2) return [];

        const headers = rows[0].map((h: string) => h.toLowerCase().trim());

        const nfIdx = headers.findIndex((h: string) => h.includes('nf') || h.includes('nota'));
        const clienteIdx = headers.findIndex((h: string) => h.includes('cliente'));
        const horasIdx = headers.findIndex((h: string) => h.includes('horas') || h.includes('pendente'));
        const statusIdx = headers.findIndex((h: string) => h.includes('status'));
        const cadastroIdx = headers.findIndex((h: string) => h.includes('cadastro') || h.includes('horário'));

        const allItems = rows.slice(1).map((row: any[], index: number) => {
            const rawCadastroValue = row[cadastroIdx] || "";
            let cadastroTime = 0;

            if (rawCadastroValue) {
                const val = rawCadastroValue.toString().trim();

                // Formato HH:mm
                if (/^(\d{1,2}):(\d{2})(:(\d{2}))?$/.test(val)) {
                    const parts = val.split(':').map(Number);
                    const now = new Date();
                    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parts[0], parts[1], parts[2] || 0);
                    cadastroTime = d.getTime();
                }
                // Formato DD/MM/YYYY
                else if (val.includes('/')) {
                    const [datePart, timePart] = val.split(' ');
                    const [d, m, y] = datePart.split('/').map(Number);
                    let hh = 0, mm = 0, ss = 0;
                    if (timePart) {
                        const tp = timePart.split(':').map(Number);
                        hh = tp[0] || 0; mm = tp[1] || 0; ss = tp[2] || 0;
                    }
                    const dt = new Date(y, m - 1, d, hh, mm, ss);
                    cadastroTime = isNaN(dt.getTime()) ? 0 : dt.getTime();
                } else {
                    const pd = new Date(val);
                    cadastroTime = isNaN(pd.getTime()) ? 0 : pd.getTime();
                }
            }

            let calculatedHours = 0;
            if (cadastroTime > 0) {
                calculatedHours = Math.max(0, (Date.now() - cadastroTime) / (1000 * 60 * 60));
            } else {
                calculatedHours = parseFloat(row[horasIdx]) || 0;
            }

            return {
                row: index + 2,
                nf: row[nfIdx] || "---",
                cliente: row[clienteIdx] || "---",
                horasPendentes: calculatedHours,
                status: (row[statusIdx] || "pendente").toLowerCase().trim(),
                cadastroTime,
                horarioCadastro: rawCadastroValue || "---"
            };
        });

        return allItems
            .filter((item: RecebimentoNF) => item.status === 'pendente')
            .sort((a: RecebimentoNF, b: RecebimentoNF) => {
                const tA = a.cadastroTime || 0;
                const tB = b.cadastroTime || 0;
                if (tA > 0 && tB > 0) return tA - tB; // Menor tempo (mais antigo) primeiro
                if (tA > 0) return -1;
                if (tB > 0) return 1;
                return 0;
            });
    } catch (error) {
        console.error("[Sheets] Erro fatal durante a leitura:", error);
        return [];
    }
}

export async function updateNFStatus(rowNumber: number, status: string) {
    console.log(`[Sheets] Solicitando atualização da linha ${rowNumber} para status: ${status}`);

    try {
        if (!CLIENT_EMAIL || !PRIVATE_KEY) {
            return {
                success: false,
                message: "Service Account não configurada no .env. Verifique SHEET_NFS_CLIENT_EMAIL e SHEET_NFS_PRIVATE_KEY."
            };
        }

        const sheets = await getSheetsClient();

        // Find the "status" column index first
        const headerResponse = await sheets.spreadsheets.values.get({
            spreadsheetId: SHEET_ID,
            range: "A1:Z1",
        });

        const headers = headerResponse.data.values?.[0].map((h: string) => h.toLowerCase().trim()) || [];
        const statusIdx = headers.findIndex((h: string) => h.includes('status'));

        if (statusIdx === -1) {
            throw new Error("Coluna 'Status' não encontrada na planilha.");
        }

        // Convert index to column letter (0 -> A, 1 -> B, etc.)
        const columnLetter = String.fromCharCode(65 + statusIdx);
        const range = `${columnLetter}${rowNumber}`;

        await sheets.spreadsheets.values.update({
            spreadsheetId: SHEET_ID,
            range: range,
            valueInputOption: "RAW",
            requestBody: {
                values: [[status]],
            },
        });

        console.log(`[Sheets] Status atualizado com sucesso na célula ${range}`);
        return { success: true };
    } catch (error: any) {
        console.error("[Sheets] Erro ao atualizar status:", error);
        return {
            success: false,
            message: `Erro na atualização: ${error.message || "Entre em contato com o suporte."}`
        };
    }
}
