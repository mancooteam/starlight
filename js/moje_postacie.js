document.addEventListener('DOMContentLoaded', async () => {
    const auth = await getAuth(); // Pobiera {loggedIn: true, id: 5, ...}

    if (!auth.loggedIn) {
        window.location.href = 'login.html';
        return;
    }

    // Pobieramy postacie filtrując po ID zalogowanego usera
    const res = await fetch(`api/characters.php?owner_id=${auth.id}`);
    const myChars = await res.json();

    const container = document.getElementById('my-characters-container');

    if (myChars.length === 0) {
        container.innerHTML = "<p class='text-center mt-5'>Nie stworzyłeś jeszcze żadnej postaci.</p>";
        return;
    }

    container.innerHTML = myChars.map(c => `
        <div class="col-md-3 mb-4">
            <div class="card h-100 character-card" style="border-top: 5px solid ${getGroupColor(c.klan)}">
                <img src="${c.url_awatara}" class="card-img-top" style="height:150px; object-fit:cover;">
                <div class="card-body text-center p-2">
                    <h6 class="${getGroupStyleClass(c.klan)}">${c.imie}</h6>
                    <a href="editor.html?id=${c.id_postaci}" class="btn btn-sm btn-warning w-100 mt-2">EDYTUJ</a>
                </div>
            </div>
        </div>
    `).join('');
});