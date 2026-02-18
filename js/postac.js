document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const charId = urlParams.get('id');

    if (!charId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        // 1. Pobierz status zalogowanego (aby sprawdzić uprawnienia do edycji)
        const auth = await getAuth();

        // 2. Pobierz dane postaci
        const res = await fetch(`api/characters.php?id=${charId}`);
        const char = await res.json();

        if (char.error) {
            showToast("Postać nie istnieje", "danger");
            setTimeout(() => window.location.href = 'index.html', 2000);
            return;
        }

        renderCharacterPage(char, auth);
        loadAuthorOtherCharacters(char.id_wlasciciela, char.id_postaci);

    } catch (e) {
        console.error(e);
        showToast("Błąd ładowania profilu", "danger");
    }
});

function renderCharacterPage(char, auth) {
    // Pokaż kontener, ukryj spinner
    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('character-content').classList.remove('d-none');

    // Imie i Stylizacja Grupy
    const nameEl = document.getElementById('char-name');
    nameEl.innerText = char.imie;
    nameEl.className = 'group-name ' + getGroupStyleClass(char.klan); // Funkcja z utils.js

    // Akcent karty (border-top)
    const cardEl = document.getElementById('profile-accent-card');
    cardEl.style.borderTopColor = getGroupAccentBorder(char.klan); // Funkcja z utils.js

    // Podstawy
    document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
    document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
    document.getElementById('char-description').innerText = char.opis || "Brak opisu postaci.";

    // Przycisk edycji (tylko dla właściciela lub admina)
    if (auth.loggedIn && (auth.id == char.id_wlasciciela || auth.rola === 'administrator')) {
        document.getElementById('edit-button-container').innerHTML = `
            <a href="editor.html?id=${char.id_postaci}" class="btn btn-warning btn-sm fw-bold">EDYTUJ POSTAĆ</a>
        `;
    }

    // --- RENDEROWANIE STATYSTYK (Skalowanie 100 i 300) ---
    const statsDef = [
        { label: 'Siła', val: char.sila, max: 100 },
        { label: 'Zręczność', val: char.zrecznosc, max: 100 },
        { label: 'Szybkość', val: char.szybkosc, max: 100 },
        { label: 'Odporność', val: char.odpornosc, max: 100 },
        { label: 'Punkty Życia', val: char.hp, max: 300 },
        { label: 'Wytrzymałość', val: char.wytrzymalosc, max: 300 }
    ];

    const statsHtml = statsDef.map(s => {
        const percent = Math.min((s.val / s.max) * 100, 100);
        return `
            <div class="mb-3">
                <div class="d-flex justify-content-between small mb-1">
                    <span class="fw-bold">${s.label}</span>
                    <span style="color: var(--em2)">${s.val} / ${s.max}</span>
                </div>
                <div class="stats-bar">
                    <div class="stats-fill" style="width: ${percent}%;"></div>
                </div>
            </div>
        `;
    }).join('');
    document.getElementById('stats-container').innerHTML = statsHtml;

    // --- RENDEROWANIE CECH ---
    const traitsContainer = document.getElementById('traits-container');
    if (char.cechy && char.cechy.length > 0) {
        traitsContainer.innerHTML = char.cechy.map(t => {
            let color = 'var(--tekst)';
            if(t.typ === 'pozytywna') color = 'var(--em2)';
            if(t.typ === 'negatywna') color = '#CA4250';
            if(t.typ === 'ciezka_negatywna') color = '#8B0000';

            return `<span class="trait-badge" style="border-color: ${color}; color: ${color}">${t.nazwa}</span>`;
        }).join('');
    } else {
        traitsContainer.innerHTML = '<p class="text-muted small">Brak szczególnych cech.</p>';
    }
}

async function loadAuthorOtherCharacters(ownerId, currentCharId) {
    const res = await fetch(`api/characters.php?owner_id=${ownerId}`);
    const others = await res.json();

    const list = document.getElementById('other-chars-list');
    const filtered = others.filter(c => c.id_postaci !== currentCharId);

    if (filtered.length === 0) {
        list.innerHTML = '<p class="text-muted x-small">To jedyna postać tego autora.</p>';
        return;
    }

    list.innerHTML = filtered.map(c => `
        <a href="postac.html?id=${c.id_postaci}" class="d-flex align-items-center mb-2 text-decoration-none p-2 rounded bg-dark border border-secondary">
            <img src="${c.url_awatara}" style="width:30px; height:30px; object-fit:cover;" class="rounded me-2">
            <div class="small text-white">${c.imie}</div>
        </a>
    `).join('');
}