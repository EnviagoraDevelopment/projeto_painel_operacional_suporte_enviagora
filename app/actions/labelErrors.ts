"use server";

import { isToday } from "date-fns";

const SHEET_ID = process.env.SHEET_ERRO_ETIQUETAS_PLANILHA_ID || process.env.SHEET_ERRO_ETIQUETAS_ID;
const API_KEY = process.env.SHEET_NFS_PRIVATE_KEY_ETIQUETA_ERROS || process.env.SHEET_ERRO_ETIQUETAS_API_KEY;

export interface LabelError {
    client: string;
    date: string;
    isToday: boolean;
}

export interface LabelErrorSummary {
    totalToday: number;
    errorsByClient: { name: string; value: number }[];
    recentErrors: LabelError[];
}

export async function getLabelErrors(): Promise<LabelErrorSummary> {
    console.log("[LabelErrors] Iniciando busca de dados via API Key...");

    if (!SHEET_ID || !API_KEY) {
        console.error("[LabelErrors] Configuração ausente (ID ou API_KEY)");
        return { totalToday: 0, errorsByClient: [], recentErrors: [] };
    }

    try {
        const response = await fetch(
            `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/Backup!A:Z?key=${API_KEY}`,
            { next: { revalidate: 10 } }
        );

        if (!response.ok) {
            const err = await response.json();
            console.error("[LabelErrors] Erro na API do Google:", err);
            return { totalToday: 0, errorsByClient: [], recentErrors: [] };
        }

        const data = await response.json();
        const rows = data.values;
        if (!rows || rows.length < 2) {
            return { totalToday: 0, errorsByClient: [], recentErrors: [] };
        }

        const headers = rows[0].map((h: any) => h.toString().toLowerCase().trim());
        const dataIdx = headers.findIndex((h: string) => h.includes('data'));
        const clienteIdx = headers.findIndex((h: string) => h.includes('cliente'));

        console.log("[LabelErrors] Colunas encontradas:", headers.join(" | "));
        console.log("[LabelErrors] Índices:", { dataIdx, clienteIdx });

        if (dataIdx === -1 || clienteIdx === -1) {
            console.error("[LabelErrors] Colunas obrigatórias não encontradas (Data/Cliente)");
            return { totalToday: 0, errorsByClient: [], recentErrors: [] };
        }

        const errors: LabelError[] = [];
        const clientCounts: Record<string, number> = {};
        let totalToday = 0;

        console.log(`[LabelErrors] Processando ${rows.length - 1} linhas de dados...`);

        // Log das 3 primeiras linhas de dados para conferência de formato
        if (rows.length > 1) {
            console.log("[LabelErrors] Amostra de dados (primeiras 3 linhas):");
            rows.slice(1, 4).forEach((r: any, idx: number) => {
                console.log(` Linha ${idx + 2}: Data="${r[dataIdx]}" | Cliente="${r[clienteIdx]}"`);
            });
        }

        // Processamos de trás para frente para pegar os mais recentes
        for (let i = rows.length - 1; i >= 1; i--) {
            const row = rows[i];
            const rawDate = row[dataIdx];
            const rawClient = row[clienteIdx];

            if (!rawDate || !rawClient) continue;

            let dateObj: Date | null = null;
            const dateStr = rawDate.toString().trim();

            // Formato DD/MM/YYYY
            if (dateStr.includes('/')) {
                const parts = dateStr.split(' ')[0].split('/');
                dateObj = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
            }
            // Formato YYYY-MM-DD
            else if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
                const parts = dateStr.split(' ')[0].split('-');
                dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
            }
            else {
                dateObj = new Date(dateStr);
            }

            // Verifica se é hoje ignorando a hora
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const compareDate = new Date(dateObj);
            compareDate.setHours(0, 0, 0, 0);

            const errorIsToday = dateObj ? compareDate.getTime() === today.getTime() : false;
            const client = rawClient.toString().trim().toUpperCase();

            if (errorIsToday) {
                totalToday++;
                clientCounts[client] = (clientCounts[client] || 0) + 1;
            }

            errors.push({
                client,
                date: dateStr,
                isToday: errorIsToday
            });
        }

        const errorsByClient = Object.entries(clientCounts)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);

        console.log("\n--- [LABEL ERRORS REFRESH] ---");
        console.log(`Total de erros hoje: ${totalToday}`);
        console.log("Resumo por Cliente (Hoje):");
        errorsByClient.forEach(c => {
            console.log(`- ${c.name}: ${c.value} erros`);
        });
        console.log("-----------------------------\n");

        return {
            totalToday,
            errorsByClient,
            recentErrors: errors.slice(0, 50) // Limitamos para o resumo
        };

    } catch (error: any) {
        console.error("[LabelErrors] Erro ao buscar dados:", error.message);
        return { totalToday: 0, errorsByClient: [], recentErrors: [] };
    }
}
