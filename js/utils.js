const Groups = ["Klan Cienia", "Klan Wichru", "Klan Rzeki", "Klan Gromu", "Plemię Niedźwiedzich Kłów", "Plemię Wiecznych Łowów", "Gwiezdny Klan", "Ciemny Las", "Pustka", "Npc", "Samotnik", "Bractwo Krwi"];
const Ranks = ["Kocię", "Terminator", "Nowicjusz", "Wojownik", "Przywódca", "Zastępca", "Medyk", "Starszyzna", "Samotnik"];

const GroupConfig = {
    "Gwiezdny Klan": { color: "#5C5AA6", class: "txt-gwiezdny-klan" },
    "Ciemny Las": { color: "#8F534B", class: "txt-ciemny-las" },
    "Klan Cienia": { color: "#E38F9C", class: "txt-klan-cienia" },
    "Klan Gromu": { color: "#FFCE7A", class: "txt-klan-gromu" },
    "Klan Rzeki": { color: "#7898FF", class: "txt-klan-rzeki" },
    "Klan Wichru": { color: "#A3E0D5", class: "txt-klan-wichru" },
    "Samotnik": { color: "#7DBF65", class: "txt-samotnik" }
};

function getGroupStyleClass(g) { return GroupConfig[g] ? GroupConfig[g].class : ""; }
function getGroupColor(g) { return GroupConfig[g] ? GroupConfig[g].color : "#96C433"; }

async function getAuth() {
    try {
        const r = await fetch('api/auth.php?action=status');
        return await r.json();
    } catch(e) { return {loggedIn: false, rola: 'gosc'}; }
}