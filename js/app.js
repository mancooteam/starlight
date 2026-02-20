const klanKolory = {
    "Gwiezdny Klan": "#5C5AA6", "Pustka": "#6C8570", "Plemię Wiecznych Łowów": "#886CAB",
    "Ciemny Las": "#8F534B", "Klan Cienia": "#E38F9C", "Klan Gromu": "#FFCE7A",
    "Klan Rzeki": "#7898FF", "Klan Wichru": "#A3E0D5", "Plemię Niedźwiedzich Kłów": "#ffffff",
    "Bractwo Krwi": "#CA4250", "Samotnik": "#7DBF65", "Nieaktywny": "#828282"
};

const typyCechKolory = {
    'pozytywna': '#28a745', 'mieszana': '#ffc107',
    'negatywna': '#dc3545', 'ciezka_negatywna': '#6610f2'
};

document.addEventListener('DOMContentLoaded', () => {
    populateKlanSelect();
    fetchCharacters();
    setupAuthListeners();
});

function populateKlanSelect() {
    const s = document.getElementById('klan-select');
    Object.keys(klanKolory).forEach(k => s.add(new Option(k, k)));
}

async function fetchCharacters() {
    const res = await fetch('get_characters.php');
    const result = await res.json();
    if (result.status === 'success') {
        renderCards(result.data, result.current_user, result.role);
        populateTraits(result.all_traits);
        updateAuthUI(result.role, result.login);
    }
}

function renderCards(chars, userId, role) {
    const container = document.getElementById('character-list');
    container.innerHTML = chars.map(char => {
        const kolor = klanKolory[char.klan] || "#828282";
        const canEdit = (role === 'admin' || char.id_wlasciciela == userId);

        let cechyHtml = '';
        if (char.cechy_listy) {
            const nazwy = char.cechy_listy.split(', ');
            const typy = char.cechy_typy.split(', ');
            cechyHtml = nazwy.map((n, i) => `
                <span class="badge rounded-pill badge-trait me-1 mb-1" style="background-color: ${typyCechKolory[typy[i]] || '#666'}">
                    ${n}
                </span>`).join('');
        }

        return `
            <div class="col-md-4 col-lg-3">
                <div class="card shadow-sm" style="border-top: 5px solid ${kolor}">
                    <img src="${char.url_awatara || 'https://via.placeholder.com/300'}" class="card-img-top avatar-img">
                    <div class="card-body text-center d-flex flex-column">
                        <h5 class="fw-bold mb-1" style="color: ${kolor === '#ffffff' ? '#fff' : kolor}">${char.imie}</h5>
                        <div class="mb-2">
                            <span class="badge" style="background-color: ${kolor}; color: ${getContrast(kolor)}">${char.ranga}</span>
                        </div>
                        <div class="mb-3 text-center">${cechyHtml || '<small class="text-muted">Brak cech</small>'}</div>
                        <div class="mt-auto pt-2 border-top border-secondary">
                            ${canEdit ? `<button class="btn btn-sm btn-outline-warning w-100">Edytuj</button>` : `<small class="text-muted">${char.klan}</small>`}
                        </div>
                    </div>
                </div>
            </div>`;
    }).join('');
}

function populateTraits(traits) {
    const s = document.getElementById('traits-select');
    if (s.children.length === 0) {
        traits.forEach(t => s.add(new Option(`[${t.typ}] ${t.nazwa}`, t.id)));
    }
}

function setupAuthListeners() {
    document.getElementById('login-form').onsubmit = async (e) => {
        e.preventDefault();
        const res = await fetch('auth.php?action=login', {
            method: 'POST',
            body: JSON.stringify({
                login: document.getElementById('login-input').value,
                password: document.getElementById('pass-input').value
            })
        });
        const result = await res.json();
        if (result.status === 'success') location.reload();
        else document.getElementById('login-error').innerText = result.message;
    };
}

function updateAuthUI(role, login) {
    const isGuest = (role === 'guest');
    document.getElementById('login-nav-btn').classList.toggle('d-none', !isGuest);
    document.getElementById('logout-btn').classList.toggle('d-none', isGuest);
    document.getElementById('add-char-btn').classList.toggle('d-none', isGuest);
    if (!isGuest) {
        const d = document.getElementById('user-display');
        d.innerText = `Witaj, ${login}`;
        d.classList.remove('d-none');
    }
}

async function logout() { await fetch('auth.php?action=logout'); location.reload(); }

function getContrast(hex) {
    hex = hex.replace("#", "");
    const r = parseInt(hex.substr(0,2),16), g = parseInt(hex.substr(2,2),16), b = parseInt(hex.substr(4,2),16);
    return ((r*299)+(g*587)+(b*114))/1000 >= 128 ? 'black' : 'white';
}