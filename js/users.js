document.addEventListener('DOMContentLoaded', async () => {
    loadUsers();
});

async function loadUsers() {
    try {
        const res = await fetch('api/users.php');
        if (res.status === 403) {
            alert("Brak dostępu! Tylko dla adminów.");
            window.location.href = 'index.html';
            return;
        }
        const users = await res.json();
        renderUsers(users);
    } catch (e) {
        console.error("Błąd ładowania użytkowników", e);
    }
}

function renderUsers(users) {
    const tbody = document.getElementById('user-table-body');
    tbody.innerHTML = users.map(user => `
        <tr>
            <td>
                <img src="${user.url_awatara}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%; border: var(--border);">
            </td>
            <td>${user.nazwa_uzytkownika} (ID: ${user.id})</td>
            <td>
                <select class="form-select form-select-sm bg-dark text-white border-secondary" 
                        onchange="updateRole(${user.id}, this.value)">
                    <option value="uzytkownik" ${user.rola === 'uzytkownik' ? 'selected' : ''}>Użytkownik</option>
                    <option value="administrator" ${user.rola === 'administrator' ? 'selected' : ''}>Administrator</option>
                    <option value="gosc" ${user.rola === 'gosc' ? 'selected' : ''}>Gość (Zablokowany)</option>
                </select>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${user.id})">Usuń</button>
            </td>
        </tr>
    `).join('');
}

async function updateRole(userId, newRole) {
    const res = await fetch('api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_role', user_id: userId, new_role: newRole })
    });
    const result = await res.json();
    if (result.error) alert(result.error);
    loadUsers(); // Odśwież listę
}

async function deleteUser(userId) {
    if (!confirm("Czy na pewno chcesz usunąć tego użytkownika i wszystkie jego postacie?")) return;

    const res = await fetch('api/users.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_user', user_id: userId })
    });
    const result = await res.json();
    if (result.error) alert(result.error);
    loadUsers();
}