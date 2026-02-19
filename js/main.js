async function load() {
    try {
        const res = await fetch('api/get_characters.php');

        // Sprawdzamy czy odpowiedź w ogóle dotarła
        if (!res.ok) {
            throw new Error(`Błąd serwera: ${res.status}`);
        }

        const data = await res.json();
        console.log("Dane z API:", data); // Zobaczysz to w konsoli F12

        // Sprawdzamy czy PHP nie zwrócił błędu połączenia z db_connect.php
        if (data.error) {
            document.getElementById('char-list').innerHTML = `
                <div class="alert alert-danger">Błąd bazy: ${data.error}</div>`;
            return;
        }

        const box = document.getElementById('auth-box');
        if(data.session && data.session.isLoggedIn) {
            box.innerHTML = `<a href="add.html" class="btn btn-success me-2">Dodaj</a>
                             <button onclick="logout()" class="btn btn-danger">Wyloguj</button>`;
        } else {
            box.innerHTML = `<a href="login.html" class="btn btn-primary me-2">Logowanie</a>
                             <a href="register.html" class="btn btn-outline-light">Rejestracja</a>`;
        }

        const list = document.getElementById('char-list');
        list.innerHTML = ''; // Czyścimy przed ładowaniem

        if (!data.chars || data.chars.length === 0) {
            list.innerHTML = '<div class="col-12 text-center text-muted">Brak postaci w bazie. Dodaj pierwszą!</div>';
            return;
        }

        data.chars.forEach(c => {
            list.innerHTML += `
                <div class="col-md-3 mb-4">
                    <div class="card h-100 shadow-sm">
                        <img src="${c.url_awatara || 'https://via.placeholder.com/150'}" class="card-img-top" style="height:200px; object-fit:cover;">
                        <div class="card-body">
                            <h5 class="text-warning">${c.imie}</h5>
                            <p class="small text-secondary mb-1">Ranga: ${c.ranga}</p>
                            <p class="small text-secondary">Klan: ${c.klan}</p>
                            <a href="character.html?id=${c.id_postaci}" class="btn btn-sm btn-outline-warning w-100">Zobacz profil</a>
                        </div>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Błąd ładowania:", err);
        document.getElementById('char-list').innerHTML = `<div class="alert alert-danger">Nie udało się połączyć z API: ${err.message}</div>`;
    }
}

function logout() {
    fetch('api/logout.php').then(() => location.reload());
}

load();