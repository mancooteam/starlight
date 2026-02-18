document.addEventListener('DOMContentLoaded', async () => {
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return window.location.href = 'index.html';

    const auth = await getAuth();
    const res = await fetch(`api/characters.php?id=${id}`);
    const char = await res.json();

    if (char.error) return window.location.href = 'index.html';

    // UI
    const nameEl = document.getElementById('char-name');
    nameEl.innerText = char.imie;
    nameEl.className = 'group-name ' + getGroupStyleClass(char.klan);
    document.getElementById('profile-accent-card').style.borderTop = `6px solid ${getGroupColor(char.klan)}`;
    document.getElementById('char-avatar').src = char.url_awatara || 'https://via.placeholder.com/400';
    document.getElementById('char-basic').innerText = `${char.ranga} • ${char.klan}`;
    document.getElementById('char-desc').innerText = char.opis;

    if (auth.loggedIn && (auth.id == char.id_wlasciciela || auth.rola === 'administrator')) {
        document.getElementById('edit-btn-box').innerHTML = `<a href="editor.html?id=${char.id_postaci}" class="btn btn-warning w-100 fw-bold">EDYTUJ</a>`;
    }

    // Statystyki
    const sDef = [
        { n: 'Siła', v: char.sila, m: 100 }, { n: 'Zręczność', v: char.zrecznosc, m: 100 },
        { n: 'Szybkość', v: char.szybkosc, m: 100 }, { n: 'Odporność', v: char.odpornosc, m: 100 },
        { n: 'HP', v: char.hp, m: 300 }, { n: 'Wytrzymałość', v: char.wytrzymalosc, m: 300 }
    ];
    document.getElementById('stats-box').innerHTML = sDef.map(s => `
        <div class="mb-3">
            <div class="d-flex justify-content-between small"><span>${s.n}</span><span>${s.v}/${s.m}</span></div>
            <div class="stats-bar"><div class="stats-fill" style="width:${(s.v/s.m)*100}%"></div></div>
        </div>
    `).join('');

    // Cechy
    const tBox = document.getElementById('traits-box');
    if (char.cechy && char.cechy.length > 0) {
        tBox.innerHTML = char.cechy.map(t => {
            let c = 'var(--tekst)';
            if(t.typ === 'pozytywna') c = 'var(--em2)';
            if(t.typ === 'negatywna') c = 'var(--c-bractwo)';
            return `<span class="trait-badge" style="border-color:${c}; color:${c}">${t.nazwa}</span>`;
        }).join('');
    }
});