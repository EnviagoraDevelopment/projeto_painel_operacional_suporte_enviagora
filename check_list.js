
const token = "pk_260564076_S7XSZQW6KXWMZAC0EIBC8KD9972RQ4WT";
const listId = "901320985908";

async function checkList() {
    try {
        const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task`, {
            headers: { Authorization: token }
        });
        const data = await response.json();
        console.log(`Tasks count: ${data.tasks?.length || 0}`);
        if (data.tasks?.[0]) {
            console.log(`First task: ${data.tasks[0].name}`);
            console.log(`Statuses available in list:`, data.tasks[0].status);
        }

        const listInfoResponse = await fetch(`https://api.clickup.com/api/v2/list/${listId}`, {
            headers: { Authorization: token }
        });
        const listInfo = await listInfoResponse.json();
        console.log(`List Info:`, listInfo.name, listInfo.statuses);
    } catch (error) {
        console.error("Error:", error);
    }
}

checkList();
