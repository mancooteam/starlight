const Groups = ["Klan Cienia", "Klan Wichru", "Klan Rzeki", "Klan Gromu", "Gwiezdny Klan", "Ciemny Las", "Samotnik"];
const GroupConfig = {
    "Klan Gromu": { color: "#FFCE7A", class: "txt-klan-gromu" },
    "Klan Rzeki": { color: "#7898FF", class: "txt-klan-rzeki" },
    "Klan Cienia": { color: "#E38F9C", class: "txt-klan-cienia" },
    "Gwiezdny Klan": { color: "#5C5AA6", class: "txt-gwiezdny-klan" }
};

function getGroupStyleClass(g) { return GroupConfig[g] ? GroupConfig[g].class : ""; }
function getGroupColor(g) { return GroupConfig[g] ? GroupConfig[g].color : "#96C433"; }

async function getAuth() {
    try {
        const r = await fetch('api/auth.php?action=status');
        return await r.json();
    } catch(e) { return {loggedIn: false, rola: 'gosc'}; }
}