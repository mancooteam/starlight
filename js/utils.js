const GroupConfig = {
    "Klan Gromu": { color: "#FFCE7A", class: "txt-klan-gromu" },
    "Klan Rzeki": { color: "#7898FF", class: "txt-klan-rzeki" },
    "Klan Cienia": { color: "#E38F9C", class: "txt-klan-cienia" }
};

function getGroupStyle(g) { return GroupConfig[g] || { color: "#96C433", class: "" }; }

async function getAuth() {
    try {
        const r = await fetch('api/auth.php?action=status');
        return await r.json();
    } catch(e) { return {loggedIn: false, rola: 'gosc'}; }
}

async function logout() {
    await fetch('api/auth.php?action=logout');
    location.reload();
}