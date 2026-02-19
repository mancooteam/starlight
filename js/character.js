document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const charId = params.get('id');

    if (!charId) {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch(`api/get_character_details.php?id=${charId}`);
        const result = await response.json();

        if (result.status === 'success') {
            renderMainCharacter(result.character);
            renderOtherCharacters(result.other_characters);
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Błąd ładowania:", err);
    }
});

function renderMainCharacter(char) {
    const container = document.getElementById('character-details');
    container.innerHTML = `
        <div class="col-md-4 text-center">
            <img src="${char.url_awatara || 'https://via.placeholder.com/300'}" class="img-fluid rounded shadow border border-secondary" alt="${char.imie}">
        </div>
        <div class="col-md-8">
            <h1 class="display-4 text-warning">${char.imie}</h1>
            <p class="lead">${char.klan} — <strong>${char.ranga}</strong></p>
            <div class="bg-secondary p-3 rounded mb-3">
                <h5>Opis</h5>
                <p>${char.opis || 'Brak opisu.'}</p>
            </div>
            <div class="row text-center">
                <div class="col-4"><strong>Siła:</strong><br>${char.sila}</div>
                <div class="col-4"><strong>Zręczność:</strong><br>${char.zrecznosc}</div>
                <div class="col-4"><strong>Szybkość:</strong><br>${char.szybkosc}</div>
            </div>
        </div>
    `;
}

function renderOtherCharacters(others) {
    const container = document.getElementById('other-characters');
    if (others.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-muted">Ten użytkownik nie ma innych postaci.</p></div>';
        return;
    }

    others.forEach(other => {
        container.innerHTML += `
            <div class="col-md-2 col-sm-4 mb-3">
                <a href="character.html?id=${other.id_postaci}" class="text-decoration-none">
                    <div class="card bg-secondary text-white border-0 shadow-sm h-100">
                        <img src="${other.url_awatara || 'https://via.placeholder.com/150'}" class="card-img-top" style="height: 120px; object-fit: cover;">
                        <div class="card-body p-2 text-center">
                            <small class="fw-bold d-block text-truncate">${other.imie}</small>
                        </div>
                    </div>
                </a>
            </div>
        `;
    });
}