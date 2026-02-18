const Groups = ["Klan Cienia", "Klan Wichru", "Klan Rzeki", "Klan Gromu", "Plemię Niedźwiedzich Kłów", "Plemię Wiecznych Łowów", "Gwiezdny Klan", "Nieaktywny", "Ciemny Las", "Pustka", "Npc", "Samotnik", "Bractwo Krwi"];
const Ranks = ["Kocię", "Terminator", "Terminator Medyka", "Nowicjusz", "Wojownik", "Łowca", "Strażnik", "Matka/Opiekun", "Przywódca", "Zastępca", "Wieszcz Promieni Słońca", "Wieszcz Blasku Księżyca", "Samotnik", "Gwiezdny", "Martwy", "Ciemny Las"];

function showToast(msg, type = 'success') {
    const t = document.getElementById('liveToast');
    const m = document.getElementById('toast-message');
    if(!t) return;
    t.style.borderLeft = `5px solid ${type === 'danger' ? '#CA4250' : '#96C433'}`;
    m.innerText = msg;
    new bootstrap.Toast(t).show();
}

// Funkcja bezpiecznie generująca klasę CSS na podstawie klanu
function getGroupStyleClass(group) {
    if (!group) return '';
    const map = {
        "Gwiezdny Klan": "txt-gwiezdny-klan",
        "Pustka": "txt-pustka",
        "Plemię Wiecznych Łowów": "txt-plemie-wiecznych-lowow",
        "Ciemny Las": "txt-ciemny-las",
        "Klan Cienia": "txt-klan-cienia",
        "Klan Gromu": "txt-klan-gromu",
        "Klan Rzeki": "txt-klan-rzeki",
        "Klan Wichru": "txt-klan-wichru",
        "Plemię Niedźwiedzich Kłów": "txt-plemie-niedzwiedzich-klow",
        "Bractwo Krwi": "txt-bractwo-krwi",
        "Samotnik": "txt-samotnik",
        "Nieaktywny": "txt-nieaktywny",
        "Npc": ""
    };
    return map[group] || '';
}

function getGroupColor(group) {
    const map = { "Gwiezdny Klan": "#5C5AA6", "Pustka": "#6C8570", "Plemię Wiecznych Łowów": "#886CAB", "Ciemny Las": "#8F534B", "Klan Cienia": "#E38F9C", "Klan Gromu": "#FFCE7A", "Klan Rzeki": "#7898FF", "Klan Wichru": "#A3E0D5", "Plemię Niedźwiedzich Kłów": "#ffffff", "Bractwo Krwi": "#CA4250", "Samotnik": "#7DBF65", "Nieaktywny": "#828282" };
    return map[group] || "#96C433";
}

async function getAuth() {
    try {
        const r = await fetch('api/auth.php?action=status');
        return await r.json();
    } catch(e) { return { loggedIn: false, rola: 'gosc' }; }
}