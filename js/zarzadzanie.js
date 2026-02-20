document.addEventListener('DOMContentLoaded', async () => {
    // 1. Sprawdź czy użytkownik to admin
    const auth = await getAuth();
    if (!auth.loggedIn || auth.rola !== 'administrator') {
        alert("Brak uprawnień do wyświetlenia tej strony.");
        window.location.href = 'index.html';
        return;
    }

    loadUsers();
});

async function loadUsers() {
    const loader = document.getElementById('admin-loader');
    const tbody = document.getElementById('user-table-body');
    const countLabel = document.getElementById('user-count');

    try {
        const res = await fetch('api/users.php?action=list');
        const users = await res.json();

        loader.classList.add('d-none');
        countLabel.innerText = `${users.length} kont`;

        tbody.innerHTML = users.map(u => `
            <tr>
                <td class="text-muted font-monospace small">${u.id}</td>
                <td>
                    <div class="fw-bold text-white">${u.nazwa_uzytkownika}</div>
                </td>
                <td class="small text-muted">${new Date(u.data_dolaczenia).toLocaleDateString()}</td>
                <td>
                    <select class="form-select form-select-sm bg-dark text-white border-secondary" 
                            style="width: 150px;" 
                            onchange="updateRole(${u.id}, this.value)">
                        <option value="uzytkownik" ${u.rola === 'uzytkownik' ? 'selected' : ''}>Użytkownik</option>
                        <option value="administrator" ${u.rola === 'administrator' ? 'selected' : ''}>Administrator</option>
                    </select>
                </td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id}, '${u.nazwa_uzytkownika}')">
                        <i class="bi bi-trash3"></i>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">Błąd pobierania danych.</td></tr>';
    }
}

async function updateRole(userId, newRole) {
    const res = await fetch('api/users.php?action=update_role', {
        method: 'POST',
        headers: { 'Content-Type:': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'user_id': userId, 'role': newRole })
    });

    const data = await res.json();
    if (data.success) {
        console.log(`Zmieniono rolę użytkownika ${userId} na ${newRole}`);
    } else {
        alert("Błąd: " + data.error);
    }
}

async function deleteUser(userId, username) {
    if (!confirm(`Czy na pewno chcesz usunąć użytkownika ${username}? Wszystkie jego postacie również zostaną usunięte!`)) return;

    const res = await fetch('api/users.php?action=delete', {
        method: 'POST',
        headers: { 'Content-Type:': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ 'user_id': userId })
    });

    const data = await res.json();
    if (data.success) {
        loadUsers(); // Odśwież listę
    } else {
        alert("Błąd: " + data.error);
    }
}