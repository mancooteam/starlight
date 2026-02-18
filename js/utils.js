const Groups = ["Klan Cienia", "Klan Wichru", "Klan Rzeki", "Klan Gromu", "Plemię Niedźwiedzich Kłów", "Plemię Wiecznych Łowów", "Gwiezdny Klan", "Nieaktywny", "Ciemny Las", "Pustka", "Npc", "Samotnik", "Bractwo Krwi"];
const Ranks = ["Kocię", "Terminator", "Terminator Medyka", "Nowicjusz", "Wojownik", "Łowca", "Strażnik", "Matka/Opiekun", "Przywódca", "Zastępca", "Wieszcz Promieni Słońca", "Wieszcz Blasku Księżyca", "Samotnik", "Gwiezdny", "Martwy", "Ciemny Las"];

const SkillsConfig = [
    { id: 'u_lowienie', label: 'Łowienie Ryb' },
    { id: 'u_plywanie', label: 'Pływanie' },
    { id: 'u_skradanie', label: 'Skradanie się' },
    { id: 'u_tropienie', label: 'Tropienie' },
    { id: 'u_wspinaczka', label: 'Wspinaczka' },
    { id: 'u_zielarstwo', label: 'Zielarstwo' }
];

const GroupConfig = {
    "Gwiezdny Klan": { color: "#5C5AA6", class: "txt-gwiezdny-klan" },
    "Pustka": { color: "#6C8570", class: "txt-pustka" },
    "Plemię Wiecznych Łowów": { color: "#886CAB", class: "txt-plemie-wiecznych-lowow" },
    "Ciemny Las": { color: "#8F534B", class: "txt-ciemny-las" },
    "Klan Cienia": { color: "#E38F9C", class: "txt-klan-cienia" },
    "Klan Gromu": { color: "#FFCE7A", class: "txt-klan-gromu" },
    "Klan Rzeki": { color: "#7898FF", class: "txt-klan-rzeki" },
    "Klan Wichru": { color: "#A3E0D5", class: "txt-klan-wichru" },
    "Plemię Niedźwiedzich Kłów": { color: "#ffffff", class: "txt-plemie-niedzwiedzich-klow" },
    "Bractwo Krwi": { color: "#CA4250", class: "txt-bractwo-krwi" },
    "Samotnik": { color: "#7DBF65", class: "txt-samotnik" },
    "Nieaktywny": { color: "#828282", class: "txt-nieaktywny" }
};

function getGroupStyleClass(g) { return GroupConfig[g] ? GroupConfig[g].class : ""; }
function getGroupColor(g) { return GroupConfig[g] ? GroupConfig[g].color : "#96C433"; }
async function getAuth() { try { const r = await fetch('api/auth.php?action=status'); return await r.json(); } catch(e) { return {loggedIn:false}; } }