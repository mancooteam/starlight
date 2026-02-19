document.getElementById('addForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('msg');

    const payload = {
        id_postaci: document.getElementById('id_postaci').value.trim(),
        imie: document.getElementById('imie').value,
        klan: document.getElementById('klan').value,
        ranga: document.getElementById('ranga').value,
        plec: document.getElementById('plec').value,
        url_awatara: document.getElementById('url_awatara').value,
        opis: document.getElementById('opis').value,
        sila: document.getElementById('sila').value,
        zrecznosc: document.getElementById('zrecznosc').value,
        szybkosc: document.getElementById('szybkosc').value
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
            msg.textContent = "Postać została pomyślnie dodana!";
            msg.classList.remove('d-none');
            setTimeout(() => location.href = 'index.html', 1500);
        } else {
            msg.className = "alert alert-danger mt-3";
            msg.textContent = result.message || "Błąd podczas zapisywania.";
            msg.classList.remove('d-none');
        }
    } catch (err) {
        msg.className = "alert alert-danger mt-3";
        msg.textContent = "Błąd połączenia z serwerem.";
        msg.classList.remove('d-none');
    }
});