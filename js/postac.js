document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const charId = urlParams.get('id');

    if (!charId) {
        window.location.href = 'index.html';
        return;
    }

    // 1. Sprawdź status użytkownika (kto ogląda?)
    const authRes = await fetch('api/auth.php?action=status');
    const user = await authRes.json();

    // 2. Pobierz dane postaci
    try {
        const res = await fetch(`api/characters.php?id=${charId}`);
        const data = await res.json();

        if (data.error) {
            alert("Nie znaleziono postaci");
            window.location.href = 'index.html';
            return;
        }

        renderCharacter(data, user);
        loadOtherCharacters(data.id_wlasciciela, charId);
    } catch (e) {
        console.error("Błąd ładowania:", e);
    }
});

function renderCharacter(char, currentUser) {
    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('character-content').classList.remove('d-none');

    document.getElementById('char-name').innerText = char.imie;
    document.getElementById('char-avatar').src = char.url_awatara;
    document.getElementById('char-basic-info').innerHTML = `${char.ranga} | ${char.klan} | ${char.plec}<br><small class="text-secondary">ID: ${char.id_postaci}</small>`;
    document.getElementById('char-description').innerText = char.opis || "Brak opisu.";

    // Renderowanie przycisku edycji (Admin lub Właściciel)
    if (currentUser.rola === 'administrator' || currentUser.id == char.id_wlasciciela) {
        document.getElementById('edit-button-container').innerHTML = `
            <a href="editor.html?id=${char.id_postaci}" class="btn btn-sm btn-warning w-100">Edytuj Postać</a>
        `;
    }

    // Renderowanie Statystyk
    const stats = [
        { label: 'Siła', val: char.sila },
        { label: 'Zręczność', val: char.zrecznosc },
        { label: 'Szybkość', val: char.szybkosc },
        { label: 'Odporność', val: char.odpornosc },
        { label: 'HP', val: char.hp },
        { label: 'Wytrzymałość', val: char.wytrzymalosc }
    ];

    const statsHtml = stats.map(s => `
        <div class="mb-3">
            <div class="d-flex justify-content-between mb-1">
                <span>${s.label}</span>
                <span style="color: var(--em2)">${s.val}</span>
            </div>
            <div class="stats-bar"><div class="stats-progress" style="width: ${Math.min(s.val, 100)}%"></div></div>
        </div>
    `).join('');
    document.getElementById('stats-container').innerHTML = statsHtml;

    // Renderowanie Cech
    if (char.cechy && char.cechy.length > 0) {
        document.getElementById('traits-container').innerHTML = char.cechy.map(c => {
            let color = "var(--tekst)";
            if(c.typ === 'pozytywna') color = "var(--em2)";
            if(c.typ === 'negatywna') color = "#ff4d4d";
            if(c.typ === 'ciezka_negatywna') color = "#8b0000";
            return `<span class="trait-badge" style="border-color: ${color}; color: ${color};">${c.nazwa}</span>`;
        }).join(' ');
    } else {
        document.getElementById('traits-container').innerHTML = '<p class="text-muted">Brak szczególnych cech.</p>';
    }
}

// Funkcja pomocnicza: Pobieranie innych postaci tego samego autora
async function loadOtherCharacters(ownerId, currentCharId) {
    const res = await fetch(`api/characters.php?owner_id=${ownerId}`);
    const others = await res.json();

    const container = document.getElementById('other-chars-list');
    const filtered = others.filter(c => c.id_postaci !== currentCharId);

    if (filtered.length === 0) {
        container.innerHTML = '<p class="small text-muted">To jedyna postać tego autora.</p>';
        return;
    }

    container.innerHTML = filtered.map(c => `
        <a href="postac.html?id=${c.id_postaci}" class="author-card d-flex align-items-center p-2 mb-2 rounded">
            <img src="${c.url_awatara}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;" class="me-2">
            <div>
                <div class="small fw-bold">${c.imie}</div>
                <div class="x-small text-muted" style="font-size: 0.7rem;">${c.ranga}</div>
            </div>
        </a>
    `).join('');
}

function renderCharacter(char, currentUser) {
    const nameEl = document.getElementById('char-name');
    const cardEl = document.getElementById('profile-accent-card');

    // Dynamiczne stylowanie imienia i obramowania
    nameEl.innerText = char.imie;
    nameEl.className = 'group-name ' + getGroupStyleClass(char.klan);
    cardEl.style.borderTop = `6px solid ${getGroupAccentBorder(char.klan)}`;

    document.getElementById('char-avatar').src = char.url_awatara;
    document.getElementById('char-basic').innerHTML = `${char.ranga} | ${char.klan}`;

    // Statystyki ze skalowaniem do 100 i 300
    const stats = [
        { n: 'Siła', v: char.sila, m: 100 },
        { n: 'HP', v: char.hp, m: 300 },
        { n: 'Wytrzymałość', v: char.wytrzymalosc, m: 300 }
    ];

    document.getElementById('stats-box').innerHTML = stats.map(s => `
        <div class="mb-2">
            <small>${s.n}: ${s.v}/${s.m}</small>
            <div class="stats-bar"><div class="stats-fill" style="width:${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');
}