
const token = "pk_260564076_S7XSZQW6KXWMZAC0EIBC8KD9972RQ4WT";
const listId = "901320985908";

async function checkTaskDetails() {
    try {
        const response = await fetch(`https://api.clickup.com/api/v2/list/${listId}/task?include_closed=true`, {
            headers: { Authorization: token }
        });
        const data = await response.json();
        if (data.tasks?.[0]) {
            console.log(JSON.stringify(data.tasks[0], null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

checkTaskDetails();
