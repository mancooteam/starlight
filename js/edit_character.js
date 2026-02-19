document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const charId = params.get('id');

    if (!charId) { window.location.href = 'index.html'; return; }

    try {
        const response = await fetch(`api/get_character_to_edit.php?id=${charId}`);
        const result = await response.json();

        if (result.status === 'success') {
            const char = result.data;
            document.getElementById('char-id').value = char.id_postaci;
            document.getElementById('char-imie').value = char.imie;
            document.getElementById('char-klan').value = char.klan;
            // ... wypełnij resztę pól ...
        } else {
            alert(result.message);
            window.location.href = 'index.html';
        }
    } catch (err) { console.error(err); }
});

document.getElementById('edit-character-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const charId = document.getElementById('char-id').value;
    const formData = {
        id_postaci: charId,
        imie: document.getElementById('char-imie').value,
        klan: document.getElementById('char-klan').value,
        // ... reszta danych ...
    };

    const res = await fetch('api/edit_character.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
    });
    const result = await res.json();
    if (result.status === 'success') {
        window.location.href = `character.html?id=${charId}`;
    } else {
        alert(result.message);
    }
});