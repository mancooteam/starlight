document.getElementById('add-character-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const msgDiv = document.getElementById('add-msg');
    const formData = {
        imie: document.getElementById('char-imie').value,
        plec: document.getElementById('char-plec').value,
        klan: document.getElementById('char-klan').value,
        ranga: document.getElementById('char-ranga').value,
        url_awatara: document.getElementById('char-avatar').value,
        opis: document.getElementById('char-opis').value,
        sila: document.getElementById('char-sila').value,
        zrecznosc: document.getElementById('char-zrecznosc').value,
        szybkosc: document.getElementById('char-szybkosc').value
    };

    try {
        const response = await fetch('api/add_character.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            msgDiv.textContent = result.message;
            msgDiv.className = "alert alert-success py-2 mt-3";
            msgDiv.classList.remove('d-none');
            setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
            msgDiv.textContent = result.message;
            msgDiv.className = "alert alert-danger py-2 mt-3";
            msgDiv.classList.remove('d-none');
        }
    } catch (err) {
        msgDiv.textContent = "Błąd połączenia z serwerem.";
        msgDiv.classList.remove('d-none');
    }
});