document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = 'index.html';

    const auth = await getAuth();
    const res = await fetch(`api/characters.php?id=${id}`);
    const char = await res.json();

    if (char.error) return window.location.href = 'index.html';

    // 1. Podstawowe dane
    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('character-content').classList.remove('d-none');

    const nameEl = document.getElementById('char-name');
    nameEl.innerText = char.imie;
    nameEl.className = 'group-name ' + getGroupStyleClass(char.klan);

    document.getElementById('profile-accent-card').style.borderTop = `8px solid ${getGroupColor(char.klan)}`;
    document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
    document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
    document.getElementById('char-description').innerText = char.opis || "Brak opisu.";

    if (auth.loggedIn && (auth.id == char.id_wlasciciela || auth.rola === 'administrator')) {
        document.getElementById('edit-button-container').innerHTML = `<a href="editor.html?id=${char.id_postaci}" class="btn btn-warning btn-sm w-100 fw-bold">EDYTUJ POSTAĆ</a>`;
    }

    // 2. Statystyki
    const sDef = [
        { n: 'Siła', v: char.sila, m: 100 }, { n: 'Zręczność', v: char.zrecznosc, m: 100 },
        { n: 'Szybkość', v: char.szybkosc, m: 100 }, { n: 'Odporność', v: char.odpornosc, m: 100 },
        { n: 'HP', v: char.hp, m: 300 }, { n: 'Wytrzymałość', v: char.wytrzymalosc, m: 300 }
    ];
    document.getElementById('stats-container').innerHTML = sDef.map(s => `
        <div class="mb-3">
            <div class="d-flex justify-content-between small"><span>${s.n}</span><span style="color:var(--em2)">${s.v}/${s.m}</span></div>
            <div class="stats-bar"><div class="stats-fill" style="width:${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');

    // 3. Cechy
    const tBox = document.getElementById('traits-container');
    if (char.cechy && char.cechy.length > 0) {
        tBox.innerHTML = char.cechy.map(t => {
            let color = 'var(--em1)';
            if(t.typ === 'negatywna') color = 'var(--c-bractwo)';
            if(t.typ === 'ciezka_negatywna') color = '#8B0000';
            return `<span class="trait-badge" style="border-color:${color}; color:${color}">${t.nazwa}</span>`;
        }).join('');
    }

    // 4. Ładowanie innych postaci (NAPRAWIONE)
    loadAuthorOtherCharacters(char.id_wlasciciela, char.id_postaci);
});

async function loadAuthorOtherCharacters(ownerId, currentCharId) {
    const res = await fetch(`api/characters.php?owner_id=${ownerId}`);
    const others = await res.json();
    const list = document.getElementById('other-chars-list');

    const filtered = others.filter(c => c.id_postaci !== currentCharId);
    if (filtered.length === 0) {
        list.innerHTML = '<p class="small">Brak innych postaci.</p>';
        return;
    }

    list.innerHTML = filtered.map(c => `
        <a href="postac.html?id=${c.id_postaci}" class="d-flex align-items-center mb-2 text-decoration-none p-2 rounded bg-dark border-start" style="border-left: 4px solid ${getGroupColor(c.klan)} !important;">
            <img src="${c.url_awatara || 'https://via.placeholder.com/50'}" style="width:35px; height:35px; object-fit:cover;" class="rounded me-2">
            <div>
                <div class="small text-white fw-bold">${c.imie}</div>
                <div class="x-small">${c.ranga}</div>
            </div>
        </a>
    `).join('');
}