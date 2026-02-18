const Groups = [
    "Klan Cienia", "Klan Wichru", "Klan Rzeki", "Klan Gromu",
    "Plemię Niedźwiedzich Kłów", "Plemię Wiecznych Łowów", "Gwiezdny Klan",
    "Nieaktywny", "Ciemny Las", "Pustka", "Npc", "Samotnik", "Bractwo Krwi"
];

const Ranks = [
    "Kocię", "Terminator", "Terminator Medyka", "Nowicjusz", "Wojownik",
    "Łowca", "Strażnik", "Matka/Opiekun", "Przywódca", "Zastępca",
    "Wieszcz Promieni Słońca", "Wieszcz Blasku Księżyca", "Samotnik",
    "Gwiezdny", "Martwy", "Ciemny Las"
];

function getGroupStyleClass(group) {
    if (!group) return '';
    const slug = group.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, '-').replace(/\//g, '-');
    return `txt-${slug}`;
}

function getGroupAccentBorder(group) {
    const map = {
        "Gwiezdny Klan": "#5C5AA6", "Pustka": "#6C8570", "Plemię Wiecznych Łowów": "#886CAB",
        "Ciemny Las": "#8F534B", "Klan Cienia": "#E38F9C", "Klan Gromu": "#FFCE7A",
        "Klan Rzeki": "#7898FF", "Klan Wichru": "#A3E0D5", "Plemię Niedźwiedzich Kłów": "#ffffff",
        "Bractwo Krwi": "#CA4250", "Samotnik": "#7DBF65", "Nieaktywny": "#828282"
    };
    return map[group] || '#96C433';
}

function showToast(msg, type = 'success') {
    const t = document.getElementById('liveToast');
    const m = document.getElementById('toast-message');
    t.style.borderLeft = `5px solid ${type === 'danger' ? '#CA4250' : 'var(--em2)'}`;
    m.innerText = msg;
    new bootstrap.Toast(t).show();
}

function getGroupClass(group) {
    if (!group) return '';
    return 'accent-' + group.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-');
}

async function getAuth() {
    const r = await fetch('api/auth.php?action=status');
    return r.json();
}