
"use server";

const CLICKUP_API_URL = "https://api.clickup.com/api/v2";
const TOKEN = process.env.CLICKUP_API_TOKEN;
const LIST_ID = process.env.CLICKUP_LIST_ID;

export async function getClickUpTickets() {
    if (!TOKEN || !LIST_ID) {
        throw new Error("Missing ClickUp configuration in .env");
    }

    try {
        const response = await fetch(
            `${CLICKUP_API_URL}/list/${LIST_ID}/task?include_closed=true`,
            {
                headers: {
                    Authorization: TOKEN,
                    "Content-Type": "application/json",
                },
                next: { revalidate: 60 }, // Cache for 1 minute
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch ClickUp tasks: ${response.statusText}`);
        }

        const data = await response.json();

        return data.tasks.map((task: any) => {
            const getCustomFieldValue = (fieldName: string) => {
                const field = task.custom_fields?.find((f: any) => f.name === fieldName);
                if (!field || field.value === undefined || field.value === null) return null;

                if (field.type === "drop_down" || field.type === "labels") {
                    const options = field.type_config?.options;
                    if (options) {
                        // Dropdown value is often the index
                        if (typeof field.value === 'number' && options[field.value]) {
                            return options[field.value].name || options[field.value].label;
                        }
                        // Or the ID
                        const selectedOption = options.find((o: any) => o.id === field.value);
                        if (selectedOption) return selectedOption.name || selectedOption.label;

                        // Multiple labels
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

            return {
                id: task.id,
                name: task.name,
                status: task.status.status,
                statusColor: task.status.color,
                priority: task.priority?.priority || "none",
                priorityColor: task.priority?.color || "#ffffff",
                dateCreated: task.date_created,
                client: getCustomFieldValue("Clientes") || "Sem Cliente",
                ticketStatus: getCustomFieldValue("Status Ticket") || "Sem Status",
                url: task.url
            };
        });
    } catch (error) {
        console.error("Error fetching ClickUp tickets:", error);
        return [];
    }
}
