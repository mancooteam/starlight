document.getElementById('addForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('msg');

    // Zbieramy wszystkie dane zgodnie ze schematem bazy
    const payload = {
        id_postaci: document.getElementById('id_postaci').value.trim(),
        imie: document.getElementById('imie').value,
        ranga: document.getElementById('ranga').value,
        klan: document.getElementById('klan').value,
        plec: document.getElementById('plec').value,
        opis: document.getElementById('opis').value,
        url_awatara: document.getElementById('url_awatara').value,
        // Statystyki
        sila: parseInt(document.getElementById('sila').value) || 0,
        zrecznosc: parseInt(document.getElementById('zrecznosc').value) || 0,
        szybkosc: parseInt(document.getElementById('szybkosc').value) || 0,
        odpornosc: parseInt(document.getElementById('odpornosc').value) || 0,
        hp: parseInt(document.getElementById('hp').value) || 0,
        wytrzymalosc: parseInt(document.getElementById('wytrzymalosc').value) || 0,
        // Umiejętności
        u_lowienie: parseInt(document.getElementById('u_lowienie').value) || 0,
        u_plywanie: parseInt(document.getElementById('u_plywanie').value) || 0,
        u_skradanie: parseInt(document.getElementById('u_skradanie').value) || 0,
        u_tropienie: parseInt(document.getElementById('u_tropienie').value) || 0,
        u_wspinaczka: parseInt(document.getElementById('u_wspinaczka').value) || 0,
        u_zielarstwo: parseInt(document.getElementById('u_zielarstwo').value) || 0
    };

    try {
        const res = await fetch('api/add_character.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();

        if(result.status === 'success') {
            msg.className = "alert alert-success mt-3";
            msg.textContent = "Wojownik dołączył do klanu!";
            msg.classList.remove('d-none');
            setTimeout(() => location.href = 'index.html', 1500);
        } else {
            msg.className = "alert alert-danger mt-3";
            msg.textContent = result.message;
            msg.classList.remove('d-none');
        }
    } catch (err) {
        msg.className = "alert alert-danger mt-3";
        msg.textContent = "Błąd połączenia: " + err.message;
        msg.classList.remove('d-none');
    }
});