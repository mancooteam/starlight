document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = 'index.html';

    const auth = await getAuth();
    const res = await fetch(`api/characters.php?id=${id}`);
    const char = await res.json();

    if (char.error) return window.location.href = 'index.html';

    // UI
    document.getElementById('loading-spinner').classList.add('d-none');
    document.getElementById('character-content').classList.remove('d-none');

    const nameEl = document.getElementById('char-name');
    nameEl.innerText = char.imie;
    nameEl.className = 'group-name ' + getGroupStyleClass(char.klan);

    document.getElementById('profile-accent-card').style.borderTopColor = getGroupColor(char.klan);
    document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
    document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
    document.getElementById('char-description').innerText = char.opis || "Brak opisu.";

    if (auth.loggedIn && (auth.id == char.id_wlasciciela || auth.rola === 'administrator')) {
        document.getElementById('edit-button-container').innerHTML = `<a href="editor.html?id=${char.id_postaci}" class="btn btn-warning btn-sm w-100 fw-bold">EDYTUJ POSTAĆ</a>`;
    }

    // Statystyki
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

    // Cechy
    const traitsBox = document.getElementById('traits-container');
    if (char.cechy && char.cechy.length > 0) {
        traitsBox.innerHTML = char.cechy.map(t => {
            let color = 'var(--em1)';
            if(t.typ === 'negatywna') color = '#CA4250';
            return `<span class="trait-badge" style="border-color:${color}; color:${color}">${t.nazwa}</span>`;
        }).join('');
    }
});