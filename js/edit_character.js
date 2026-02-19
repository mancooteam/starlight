document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const charId = params.get('id');
    if (!charId) { location.href = 'index.html'; return; }

    try {
        const response = await fetch(`api/get_character_to_edit.php?id=${charId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const c = result.data;
            document.getElementById('display-name').textContent = c.imie;
            // Wypełnianie pól
            document.getElementById('id_postaci').value = c.id_postaci;
            document.getElementById('imie').value = c.imie;
            document.getElementById('klan').value = c.klan;
            document.getElementById('ranga').value = c.ranga;
            document.getElementById('plec').value = c.plec;
            document.getElementById('url_awatara').value = c.url_awatara;
            document.getElementById('opis').value = c.opis;
            document.getElementById('sila').value = c.sila;
            document.getElementById('zrecznosc').value = c.zrecznosc;
            document.getElementById('szybkosc').value = c.szybkosc;
            document.getElementById('odpornosc').value = c.odpornosc;
            document.getElementById('hp').value = c.hp;
            document.getElementById('wytrzymalosc').value = c.wytrzymalosc;
            document.getElementById('u_lowienie').value = c.u_lowienie;
            document.getElementById('u_plywanie').value = c.u_plywanie;
            document.getElementById('u_skradanie').value = c.u_skradanie;
            document.getElementById('u_tropienie').value = c.u_tropienie;
            document.getElementById('u_wspinaczka').value = c.u_wspinaczka;
            document.getElementById('u_zielarstwo').value = c.u_zielarstwo;
        } else {
            alert(result.message);
            location.href = 'index.html';
        }
    } catch (err) { console.error(err); }
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {};
    // Zbieranie wszystkich pól z formularza
    document.querySelectorAll('#editForm input, #editForm select, #editForm textarea').forEach(el => {
        if(el.id) payload[el.id] = el.value;
    });

    const res = await fetch('api/edit_character.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await res.json();
    if(result.status === 'success') location.href = `character.html?id=${payload.id_postaci}`;
    else alert(result.message);
});