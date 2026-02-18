let currentChar = null;
const bonusMap = { 0: 0, 1: 1, 2: 3, 3: 5 };

document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = 'index.html';

    try {
        const auth = await getAuth();
        const res = await fetch(`api/characters.php?id=${id}`);
        currentChar = await res.json();

        if (currentChar.error) return window.location.href = 'index.html';

        // Renderowanie profilu
        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('character-content').classList.remove('d-none');

        document.getElementById('char-name').innerText = currentChar.imie;
        document.getElementById('char-name').className = 'group-name ' + getGroupStyleClass(currentChar.klan);
        document.getElementById('profile-accent-card').style.borderTopColor = getGroupColor(currentChar.klan);
        document.getElementById('char-avatar').src = currentChar.url_awatara || 'https://via.placeholder.com/400';
        document.getElementById('char-basic').innerText = `${currentChar.ranga} • ${currentChar.klan}`;
        document.getElementById('char-description').innerText = currentChar.opis || "Brak opisu.";

        if (auth.loggedIn && (auth.id == currentChar.id_wlasciciela || auth.rola === 'administrator')) {
            document.getElementById('edit-button-container').innerHTML =
                `<a href="editor.html?id=${currentChar.id_postaci}" class="btn btn-warning btn-sm w-100 fw-bold">EDYTUJ POSTAĆ</a>`;
        }

        renderStats();
        renderSkills();
        renderTraits();
        updateGMWindow('polowanie'); // Domyślna akcja MG
        if (currentChar.id_wlasciciela) loadAuthorOtherCharacters(currentChar.id_wlasciciela, currentChar.id_postaci);

    } catch (e) { console.error("Błąd ładowania:", e); }
});

function renderStats() {
    const sDef = [
        { n: 'Siła', v: currentChar.sila, m: 100 },
        { n: 'Zręczność', v: currentChar.zrecznosc, m: 100 },
        { n: 'Szybkość', v: currentChar.szybkosc, m: 100 },
        { n: 'Odporność', v: currentChar.odpornosc, m: 100 },
        { n: 'HP', v: currentChar.hp, m: 300 },
        { n: 'Wytrzymałość', v: currentChar.wytrzymalosc, m: 300 }
    ];
    document.getElementById('stats-container').innerHTML = sDef.map(s => `
        <div class="mb-3">
            <div class="d-flex justify-content-between x-small mb-1"><span>${s.n}</span><span class="text-success">${s.v}/${s.m}</span></div>
            <div class="stats-bar"><div class="stats-fill" style="width:${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');
}

function renderSkills() {
    document.getElementById('skills-container').innerHTML = SkillsConfig.map(s => {
        const val = parseInt(currentChar[s.id]) || 0;
        return `
            <div class="d-flex justify-content-between mb-2" style="opacity:${val > 0 ? 1 : 0.4}">
                <span class="small">${s.label}</span>
                <span class="text-success fw-bold">${'●'.repeat(val)}${'○'.repeat(3-val)} (+${bonusMap[val]})</span>
            </div>
        `;
    }).join('');
}

function renderTraits() {
    const tBox = document.getElementById('traits-container');
    if (!currentChar.cechy || currentChar.cechy.length === 0) return tBox.innerHTML = '<p class="text-muted small">Brak.</p>';
    tBox.innerHTML = currentChar.cechy.map(t => {
        let c = 'var(--em2)'; if(t.typ === 'negatywna') c = '#CA4250';
        return `<span class="trait-badge" style="border-color:${c}; color:${c}">${t.nazwa}</span>`;
    }).join('');
}

// MECHANIKA MG
function updateGMWindow(action) {
    const display = document.getElementById('gm-helper-display');
    const buttons = document.querySelectorAll('#gm-action-menu button');
    buttons.forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');

    let title = "", bonus = 0, info = "";

    if (action === 'polowanie') {
        title = "Polowanie / Skradanie";
        bonus = bonusMap[currentChar.u_skradanie] + bonusMap[currentChar.u_tropienie];
        info = "Suma bonusów ze Skradania i Tropienia.";
    } else if (action === 'walka') {
        title = "Walka Fizyczna";
        bonus = Math.floor(currentChar.sila / 10) + Math.floor(currentChar.zrecznosc / 10);
        info = "Bazowy bonus z atrybutów Siła + Zręczność.";
    } else if (action === 'ziola') {
        title = "Zbieranie Ziół";
        bonus = bonusMap[currentChar.u_zielarstwo];
        info = "Bonus z umiejętności Zielarstwo.";
    } else if (action === 'lowienie') {
        title = "Łowienie Ryb";
        bonus = bonusMap[currentChar.u_lowienie];
        info = "Bonus z umiejętności Łowienie Ryb.";
    }

    display.innerHTML = `
        <h6 class="text-white fw-bold mb-1">${title}</h6>
        <p class="x-small text-muted mb-3">${info}</p>
        <div class="dice-box">
            <span class="x-small text-muted">TWÓJ BONUS</span>
            <div class="fs-2 fw-bold text-success">+${bonus}</div>
            <button class="btn btn-sm btn-outline-success mt-2" onclick="rollDice(${bonus})">RZUĆ k20</button>
            <div id="dice-result-area" class="mt-3"></div>
        </div>
    `;
}

function rollDice(bonus) {
    const resultArea = document.getElementById('dice-result-area');
    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + bonus;

    resultArea.innerHTML = `
        <div class="p-2 border border-secondary rounded">
            <span class="x-small text-muted">WYNIK RZUTU:</span>
            <div class="roll-result">${total}</div>
            <span class="x-small text-muted">(${roll} na kostce + ${bonus} bonusu)</span>
        </div>
    `;
}

async function loadAuthorOtherCharacters(ownerId, currentCharId) {
    const res = await fetch(`api/characters.php?owner_id=${ownerId}`);
    const others = await res.json();
    document.getElementById('other-chars-list').innerHTML = others.filter(c => c.id_postaci !== currentCharId).map(c => `
        <a href="postac.html?id=${c.id_postaci}" class="d-flex align-items-center mb-2 text-decoration-none p-2 rounded bg-dark border-start" style="border-left:4px solid ${getGroupColor(c.klan)} !important;">
            <img src="${c.url_awatara || 'https://via.placeholder.com/50'}" style="width:30px; height:30px; object-fit:cover;" class="rounded me-2">
            <div class="small text-white">${c.imie}</div>
        </a>
    `).join('');
}

let selectedTerrain = null;
let currentGMMode = 'polowanie'; // polowanie, lowienie, patrol

function setGMMode(mode) {
    currentGMMode = mode;
    document.querySelectorAll('#gm-action-menu button').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    checkBtnState();
}

function setTerrain(terrain) {
    selectedTerrain = terrain;
    document.querySelectorAll('.terrain-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    checkBtnState();
}

function checkBtnState() {
    document.getElementById('btn-start-action').disabled = !selectedTerrain;
}

// TABELA WYNIKÓW POCZĄTKOWYCH (zgodnie z listą 1-30+)
function getInitialMeeting(roll, mode) {
    if (roll <= 0) return "nic";
    const table = {
        1: "niespodzianka", 2: "przeciwnik", 3: "przeciwnik", 4: "nic", 5: "zwierzyna",
        6: "nic", 7: "przeciwnik", 8: "nic", 9: "zwierzyna", 10: "nic",
        11: "przeciwnik", 12: "nic", 13: "zwierzyna", 14: "nic", 15: "niespodzianka",
        16: "zwierzyna", 17: "zwierzyna", 18: "nic", 19: "przeciwnik", 20: "zwierzyna",
        21: "nic", 22: "zwierzyna", 23: "zwierzyna", 24: "zwierzyna", 25: "zwierzyna",
        26: "niespodzianka", 27: "zwierzyna", 28: "zwierzyna", 29: "niespodzianka"
    };
    let result = roll >= 30 ? "zwierzyna" : (table[roll] || "nic");

    // Obsługa Patrolu (zamiana zwierzyny z przeciwnikiem)
    if (mode === 'patrol') {
        if (result === "zwierzyna") return "przeciwnik";
        if (result === "przeciwnik") return "zwierzyna";
    }
    return result;
}

async function executeHuntRoll() {
    if (!currentChar) return;

    const resultArea = document.getElementById('gm-result-area');
    resultArea.classList.remove('d-none');

    // 1. OBLICZANIE MODYFIKATORÓW
    // Poziom postaci (przyjmujemy 1 na start jeśli brak w bazie)
    const charLevel = currentChar.poziom || 1;

    // Bonus z umiejętności (Tropienie dla polowania, Łowienie dla ryb)
    const skillLevel = (currentGMMode === 'lowienie') ? (currentChar.u_lowienie || 0) : (currentChar.u_tropienie || 0);
    const skillBonus = bonusMap[skillLevel] || 0;

    // Cechy (przykładowo, MG dodaje manualnie lub z bazy)
    const traitBonus = 0; // Tu można dodać logikę sprawdzania cech

    // 2. RZUT KOSTKĄ 1d20
    const diceRoll = Math.floor(Math.random() * 20) + 1;
    const totalResult = diceRoll + skillBonus + charLevel + traitBonus;

    // 3. WYNIK SPOTKANIA
    const meeting = getInitialMeeting(totalResult, currentGMMode);

    let html = `
        <div class="text-center mb-4">
            <span class="text-muted small">Rzut k20 (${diceRoll}) + Skill (${skillBonus}) + Level (${charLevel}) =</span>
            <h2 class="display-6 fw-bold text-white">${totalResult}</h2>
            <div class="mt-2"><span class="badge p-2 fs-6 badge-${meeting}">${meeting.toUpperCase()}</span></div>
        </div>
    `;

    if (meeting === "zwierzyna") {
        html += renderSpeciesRoll(totalResult);
    } else if (meeting === "przeciwnik") {
        html += renderEnemyRoll();
    } else if (meeting === "niespodzianka") {
        html += `<div class="alert alert-warning small"><strong>Niespodzianka:</strong> Mistrz Gry decyduje o losowym zdarzeniu (np. znalezienie przedmiotu, spotkanie kota lub zdarzenie terenowe).</div>`;
    } else {
        html += `<div class="text-center p-3 text-muted border border-secondary rounded">Mimo starań, nie udało się niczego znaleźć w tej okolicy.</div>`;
    }

    resultArea.innerHTML = html;
}

// 4. RZUTY NA GATUNEK (uproszczone tabele na podstawie terenu)
function renderSpeciesRoll(parentRoll) {
    const dice = Math.floor(Math.random() * 20) + 1; // Standardowo d20 dla większości
    let species = "Nieokreślone zwierzę";

    // Przykładowe mapowanie terenu na zwierzynę (uproszczone z Twoich tabel)
    const tables = {
        'las_glebia': { 1: 'Gawron', 3: 'Wiewiórka', 11: 'Mysz', 24: 'Zając bielak', 30: 'Zając' },
        'rzeka': { 1: 'Piżmak', 9: 'Żaba', 13: 'Mysz', 15: 'Kaczka' },
        'laki': { 3: 'Kuropatwa', 10: 'Zając', 16: 'Mysz', 30: 'Bażant' }
    };

    const currentTable = tables[selectedTerrain] || tables['las_glebia'];
    // Znajdź najbliższy klucz
    const keys = Object.keys(currentTable).map(Number).sort((a,b) => a-b);
    const resultKey = keys.find(k => dice <= k) || keys[keys.length - 1];
    species = currentTable[resultKey];

    return `
        <div class="p-3 border border-success rounded">
            <h6 class="text-success fw-bold">Wytropiono: ${species}!</h6>
            <p class="x-small text-muted mb-0">Rzut na gatunek: ${dice}. Mistrz Gry może teraz wykonać rzut na schwytanie.</p>
        </div>
    `;
}

function renderEnemyRoll() {
    const dice = Math.floor(Math.random() * 10) + 1;
    return `
        <div class="p-3 border border-danger rounded">
            <h6 class="text-danger fw-bold">Uwaga! Wyczuto zagrożenie.</h6>
            <p class="x-small text-muted">Rzut na drapieżnika: ${dice}. Mistrz Gry decyduje o zachowaniu przeciwnika (np. Lis, Borsuk, lub Pies).</p>
        </div>
    `;
}