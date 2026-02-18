
const token = "pk_260564076_S7XSZQW6KXWMZAC0EIBC8KD9972RQ4WT";

async function findSupportList() {
    try {
        const teamsResponse = await fetch('https://api.clickup.com/api/v2/team', {
            headers: { Authorization: token }
        });
        const teamsData = await teamsResponse.json();

        for (const team of teamsData.teams) {
            const spacesResponse = await fetch(`https://api.clickup.com/api/v2/team/${team.id}/space`, {
                headers: { Authorization: token }
            });
            const spacesData = await spacesResponse.json();

            for (const space of spacesData.spaces) {
                const listsResponse = await fetch(`https://api.clickup.com/api/v2/space/${space.id}/list`, {
                    headers: { Authorization: token }
                });
                const listsData = await listsResponse.json();
                if (listsData.lists) {
                    for (const list of listsData.lists) {
                        console.log(`LIST FOUND: ${list.name} ID: ${list.id}`);
                    }
                }

                const foldersResponse = await fetch(`https://api.clickup.com/api/v2/space/${space.id}/folder`, {
                    headers: { Authorization: token }
                });
                const foldersData = await foldersResponse.json();
                if (foldersData.folders) {
                    for (const folder of foldersData.folders) {
                        const folderListsResponse = await fetch(`https://api.clickup.com/api/v2/folder/${folder.id}/list`, {
                            headers: { Authorization: token }
                        });
                        const folderListsData = await folderListsResponse.json();
                        if (folderListsData.lists) {
                            for (const list of folderListsData.lists) {
                                console.log(`LIST FOUND: ${list.name} ID: ${list.id}`);
                            }
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

findSupportList();
