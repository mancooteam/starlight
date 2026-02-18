document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth();
    if (!auth.loggedIn) return window.location.href = 'login.html';

    // Populate selects from utils.js
    document.getElementById('klan_select').innerHTML = Groups.map(g => `<option value="${g}">${g}</option>`).join('');
    document.getElementById('ranga_select').innerHTML = Ranks.map(r => `<option value="${r}">${r}</option>`).join('');

    const id = new URLSearchParams(window.location.search).get('id');
    if (id) {
        const res = await fetch(`api/characters.php?id=${id}`);
        const char = await res.json();
        const f = document.getElementById('editor-form');
        f.id_postaci.value = char.id_postaci; f.id_postaci.readOnly = true;
        f.imie.value = char.imie; f.klan.value = char.klan; f.ranga.value = char.ranga;
        f.url_awatara.value = char.url_awatara; f.opis.value = char.opis; f.plec.value = char.plec;
        ['sila','zrecznosc','szybkosc','odpornosc','hp','wytrzymalosc'].forEach(s => f[s].value = char[s]);
    }

    // Load traits
    const trRes = await fetch('api/characters.php?action=get_all_traits');
    const trData = await trRes.json();
    document.getElementById('traits-list').innerHTML = trData.map(t => `
        <div class="col-6 col-md-4"><div class="form-check">
            <input class="form-check-input" type="checkbox" name="cechy[]" value="${t.id}" id="tr${t.id}">
            <label class="form-check-label small" for="tr${t.id}">${t.nazwa}</label>
        </div></div>
    `).join('');

    document.getElementById('editor-form').addEventListener('submit', async e => {
        e.preventDefault();
        const res = await fetch('api/characters.php', { method: 'POST', body: new FormData(e.target) });
        const data = await res.json();
        if (data.success) {
            showToast(data.success);
            setTimeout(() => location.href = 'postac.html?id=' + e.target.id_postaci.value, 1000);
        } else showToast(data.error, 'danger');
    });
});