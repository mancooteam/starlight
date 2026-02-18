const Groups = ["Klan Cienia", "Klan Wichru", "Klan Rzeki", "Klan Gromu", "Plemię Niedźwiedzich Kłów", "Plemię Wiecznych Łowów", "Gwiezdny Klan", "Nieaktywny", "Ciemny Las", "Pustka", "Npc", "Samotnik", "Bractwo Krwi"];
const Ranks = ["Kocię", "Terminator", "Terminator Medyka", "Nowicjusz", "Wojownik", "Łowca", "Strażnik", "Matka/Opiekun", "Przywódca", "Zastępca", "Wieszcz Promieni Słońca", "Wieszcz Blasku Księżyca", "Samotnik", "Gwiezdny", "Martwy", "Ciemny Las"];

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