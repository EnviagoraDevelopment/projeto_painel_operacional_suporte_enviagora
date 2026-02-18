
"use server";

const CLICKUP_API_URL = "https://api.clickup.com/api/v2";
const TOKEN = process.env.CLICKUP_API_TOKEN;
const TEAM_ID = "9013280644";
const SPACE_ID = "90131655438";
const MAPEAMENTO_VIEW_ID = "4-90131655438-1";

export async function getClickUpTickets() {
    if (!TOKEN) {
        throw new Error("Missing ClickUp configuration in .env");
    }

    try {
        // Buscamos as tarefas especificamente da VIEW "Mapeamento"
        const response = await fetch(
            `${CLICKUP_API_URL}/view/${MAPEAMENTO_VIEW_ID}/task`,
            {
                headers: {
                    Authorization: TOKEN,
                    "Content-Type": "application/json",
                },
                next: { revalidate: 10 }, // 10s cache
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch ClickUp tasks: ${response.statusText}`);
        }

        const data = await response.json();

        const tasks = data.tasks.map((task: any) => {
            const taskName = task.name || "";

            // Extrai todos os termos entre colchetes
            // Ex: "[URGENTE] [NUTURE] Task" -> ["URGENTE", "NUTURE"]
            const allMatches = Array.from(taskName.matchAll(/\[\s*(.*?)\s*\]/g)).map((m: any) => m[1].trim().toUpperCase());

            const getCustomFieldValue = (fieldName: string) => {
                const field = task.custom_fields?.find((f: any) => f.name === fieldName);
                if (!field || field.value === undefined || field.value === null) return null;

                if (field.type === "drop_down" || field.type === "labels") {
                    const options = field.type_config?.options;
                    if (options) {
                        if (typeof field.value === 'number' && options[field.value]) {
                            return options[field.value].name || options[field.value].label;
                        }
                        const selectedOption = options.find((o: any) => o.id === field.value);
                        if (selectedOption) return selectedOption.name || selectedOption.label;

                        if (Array.isArray(field.value)) {
                            return field.value.map((vId: string) => {
                                const opt = options.find((o: any) => o.id === vId);
                                return opt ? (opt.label || opt.name) : vId;
                            }).join(", ");
                        }
                    }
                }
                return field.value_rich_text || field.value?.toString() || null;
            };

            const customFieldClient = getCustomFieldValue("Clientes")?.toString().toUpperCase();

            // Lógica de seleção do cliente:
            // 1. Se houver termos entre [], verifique se algum coincide com o Custom Field "Clientes"
            // 2. Se não coincidir, mas houver termos entre [], pegue o primeiro
            // 3. Se não houver termos entre [], use o Custom Field "Clientes"
            // 4. Fallback final: "SEM CLIENTE"

            let finalClient = "SEM CLIENTE";
            if (allMatches.length > 0) {
                const matchingMatch = customFieldClient ? allMatches.find(m => m === customFieldClient) : null;
                finalClient = matchingMatch || allMatches[0];
            } else if (customFieldClient) {
                finalClient = customFieldClient;
            }

            // Limpa o nome removendo TODOS os colchetes para não poluir
            const cleanedName = taskName.replace(/\[\s*.*?\s*\]/g, "").trim();

            return {
                id: task.id,
                name: cleanedName,
                originalName: taskName, // Mantemos o nome original para logs/referência
                status: task.status.status,
                statusColor: task.status.color,
                priority: task.priority?.priority || "none",
                priorityColor: task.priority?.color || "#ffffff",
                dateCreated: task.date_created,
                dueDate: task.due_date,
                startDate: task.start_date,
                dateClosed: task.date_closed,
                client: finalClient,
                ticketStatus: getCustomFieldValue("Status Ticket") || "Sem Status",
                url: task.url
            };
        });

        // Log resumo dos clientes encontrados para debug
        const clientSummary = tasks.reduce((acc: Record<string, number>, t: any) => {
            acc[t.client] = (acc[t.client] || 0) + 1;
            return acc;
        }, {});

        console.log("\n--- [CLICKUP REFRESH] ---");
        console.log(`Total de tarefas processadas: ${tasks.length}`);
        console.log("Tarefas e Clientes identificados:");
        tasks.forEach((t: any) => {
            console.log(`- [TASK] "${t.originalName}" -> IDENTIFICADO COMO: ${t.client}`);
        });

        console.log("\nResumo por Cliente:");
        Object.entries(clientSummary).forEach(([client, count]) => {
            console.log(`- ${client}: ${count} tarefas`);
        });
        console.log("-------------------------\n");

        return tasks;
    } catch (error) {
        console.error("Error fetching ClickUp tickets:", error);
        return [];
    }
}
