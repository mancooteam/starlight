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
        document.getElementById('loading-spinner').classList.add('d-none');
        document.getElementById('character-content').classList.remove('d-none');

        // PODSTAWOWE DANE
        const nameEl = document.getElementById('char-name');
        nameEl.innerText = char.imie;
        nameEl.className = 'group-name ' + getGroupStyleClass(char.klan);

        document.getElementById('profile-accent-card').style.borderTopColor = getGroupColor(char.klan);
        document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
        document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
        document.getElementById('char-description').innerText = char.opis || "Brak opisu.";

        // PRZYCISK EDYCJI
        if (auth.loggedIn && (auth.id == char.id_wlasciciela || auth.rola === 'administrator')) {
            document.getElementById('edit-button-container').innerHTML =
                `<a href="editor.html?id=${char.id_postaci}" class="btn btn-warning btn-sm w-100 fw-bold">EDYTUJ POSTAĆ</a>`;
        }

        // STATYSTYKI
        renderStats(char);

        // UMIEJĘTNOŚCI
        renderSkills(char);

        // CECHY (NAPRAWIONE)
        renderTraits(char.cechy);

        // AUTOR (NAPRAWIONE - przekazujemy id_wlasciciela z bazy)
        if (char.id_wlasciciela) {
            loadAuthorOtherCharacters(char.id_wlasciciela, char.id_postaci);
        }

    } catch (e) {
        console.error("Błąd JS:", e);
    }
});

function renderStats(char) {
    const sDef = [
        {n:'Siła', v:char.sila, m:100}, {n:'HP', v:char.hp, m:300}, {n:'Wytrzymałość', v:char.wytrzymalosc, m:300}
    ];
    document.getElementById('stats-container').innerHTML = sDef.map(s => `
        <div class="mb-2">
            <div class="d-flex justify-content-between small"><span>${s.n}</span><span>${s.v}/${s.m}</span></div>
            <div class="stats-bar"><div class="stats-fill" style="width:${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');
}

function renderSkills(char) {
    const bMap = { 0:0, 1:1, 2:3, 3:5 };
    document.getElementById('skills-container').innerHTML = SkillsDef.map(s => {
        const val = char[s.id] || 0;
        return `<div class="d-flex justify-content-between x-small mb-1">
            <span>${s.l}</span>
            <span class="text-success fw-bold">${'●'.repeat(val)}${'○'.repeat(3-val)} (+${bMap[val]})</span>
        </div>`;
    }).join('');
}

function renderTraits(cechy) {
    const tBox = document.getElementById('traits-container');
    if (!cechy || cechy.length === 0) {
        tBox.innerHTML = '<p class="text-muted small">Brak cech.</p>';
        return;
    }
    tBox.innerHTML = cechy.map(t => {
        let color = 'var(--em1)';
        if(t.typ === 'negatywna') color = '#CA4250';
        if(t.typ === 'ciezka_negatywna') color = '#8B0000';
        return `<span class="trait-badge" style="border-color:${color}; color:${color}">${t.nazwa}</span>`;
    }).join('');
}

async function loadAuthorOtherCharacters(ownerId, currentCharId) {
    const res = await fetch(`api/characters.php?owner_id=${ownerId}`);
    const others = await res.json();
    const list = document.getElementById('other-chars-list');

    const filtered = others.filter(c => c.id_postaci !== currentCharId);
    if (filtered.length === 0) {
        list.innerHTML = '<p class="text-muted x-small">To jedyna postać autora.</p>';
        return;
    }

    list.innerHTML = filtered.map(c => `
        <a href="postac.html?id=${c.id_postaci}" class="d-flex align-items-center mb-2 text-decoration-none p-2 rounded bg-dark border-start" style="border-left: 4px solid ${getGroupColor(c.klan)} !important;">
            <img src="${c.url_awatara || 'https://via.placeholder.com/50'}" style="width:30px; height:30px; object-fit:cover;" class="rounded me-2">
            <div class="small text-white">${c.imie}</div>
        </a>
    `).join('');
}