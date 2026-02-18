document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = 'index.html';

    try {
        const auth = await getAuth();
        const res = await fetch(`api/characters.php?id=${id}`);
        const char = await res.json();

        if (char.error) {
            console.error("Błąd bazy:", char.error);
            return window.location.href = 'index.html';
        }

        // UKRYJ SPINNER
        const spinner = document.getElementById('loading-spinner');
        const content = document.getElementById('character-content');
        if (spinner) spinner.classList.add('d-none');
        if (content) content.classList.remove('d-none');

        // NAGŁÓWEK I STYLIZACJA
        const nameEl = document.getElementById('char-name');
        if (nameEl) {
            nameEl.innerText = char.imie;
            nameEl.className = 'group-name ' + getGroupStyleClass(char.klan);
        }

        const cardEl = document.getElementById('profile-accent-card');
        if (cardEl) cardEl.style.borderTopColor = getGroupColor(char.klan);

        document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
        document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
        document.getElementById('char-description').innerText = char.opis || "Brak opisu.";

        // PRZYCISK EDYCJI
        if (auth.loggedIn && (auth.id == char.id_wlasciciela || auth.rola === 'administrator')) {
            const btnBox = document.getElementById('edit-button-container');
            if (btnBox) btnBox.innerHTML = `<a href="editor.html?id=${char.id_postaci}" class="btn btn-warning btn-sm w-100 fw-bold">EDYTUJ POSTAĆ</a>`;
        }

        // RENDEROWANIE WSZYSTKICH SEKCJI
        renderStats(char);
        renderSkills(char);
        renderTraits(char.cechy);

        if (char.id_wlasciciela) {
            loadAuthorOtherCharacters(char.id_wlasciciela, char.id_postaci);
        }

    } catch (e) {
        console.error("Błąd krytyczny skryptu postac.js:", e);
    }
});

// FUNKCJA NAPRAWIAJĄCA STATYSTYKI
function renderStats(char) {
    const statsContainer = document.getElementById('stats-container');
    if (!statsContainer) return;

    const sDef = [
        { n: 'Siła', v: char.sila, m: 100 },
        { n: 'Zręczność', v: char.zrecznosc, m: 100 },
        { n: 'Szybkość', v: char.szybkosc, m: 100 },
        { n: 'Odporność', v: char.odpornosc, m: 100 },
        { n: 'Punkty Życia (HP)', v: char.hp, m: 300 },
        { n: 'Wytrzymałość', v: char.wytrzymalosc, m: 300 }
    ];

    statsContainer.innerHTML = sDef.map(s => {
        const value = parseInt(s.v) || 0;
        const percentage = Math.min((value / s.m) * 100, 100);

        return `
            <div class="mb-3">
                <div class="d-flex justify-content-between small mb-1">
                    <span class="fw-bold text-light">${s.n}</span>
                    <span style="color: var(--em2)">${value} / ${s.m}</span>
                </div>
                <div class="stats-bar">
                    <div class="stats-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join('');
}

function renderSkills(char) {
    const skillsContainer = document.getElementById('skills-container');
    if (!skillsContainer) return;

    const bMap = { 0: 0, 1: 1, 2: 3, 3: 5 };
    skillsContainer.innerHTML = SkillsDef.map(s => {
        const val = parseInt(char[s.id]) || 0;
        return `
            <div class="d-flex justify-content-between align-items-center mb-2" style="opacity: ${val > 0 ? '1' : '0.5'}">
                <span class="x-small">${s.l}</span>
                <span class="text-success fw-bold">
                    ${'●'.repeat(val)}${'○'.repeat(3 - val)} 
                    <small class="ms-1 text-muted">(+${bMap[val]})</small>
                </span>
            </div>
        `;
    }).join('');
}

function renderTraits(cechy) {
    const tBox = document.getElementById('traits-container');
    if (!tBox) return;

    if (!cechy || cechy.length === 0) {
        tBox.innerHTML = '<p class="text-muted small">Brak szczególnych cech.</p>';
        return;
    }

    tBox.innerHTML = cechy.map(t => {
        let color = 'var(--em1)';
        if (t.typ === 'negatywna') color = '#CA4250';
        if (t.typ === 'ciezka_negatywna') color = '#8B0000';
        if (t.typ === 'mieszana') color = 'var(--c-pustka)';

        return `<span class="trait-badge" style="border-color:${color}; color:${color}">${t.nazwa}</span>`;
    }).join('');
}

async function loadAuthorOtherCharacters(ownerId, currentCharId) {
    const list = document.getElementById('other-chars-list');
    if (!list) return;

    try {
        const res = await fetch(`api/characters.php?owner_id=${ownerId}`);
        const others = await res.json();
        const filtered = others.filter(c => c.id_postaci !== currentCharId);

        if (filtered.length === 0) {
            list.innerHTML = '<p class="text-muted x-small">To jedyna postać autora.</p>';
            return;
        }

        list.innerHTML = filtered.map(c => `
            <a href="postac.html?id=${c.id_postaci}" class="d-flex align-items-center mb-2 text-decoration-none p-2 rounded bg-dark border-start" 
               style="border-left: 4px solid ${getGroupColor(c.klan)} !important; transition: 0.2s;">
                <img src="${c.url_awatara || 'https://via.placeholder.com/50'}" style="width:35px; height:35px; object-fit:cover;" class="rounded me-2">
                <div>
                    <div class="small text-white fw-bold" style="line-height:1">${c.imie}</div>
                    <div class="x-small text-muted">${c.ranga}</div>
                </div>
            </a>
        `).join('');
    } catch (e) { console.error("Błąd ładowania innych postaci autora"); }
}