<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

// Blokada: Tylko zalogowani administratorzy
if (!isset($_SESSION['id_uzytkownika']) || $_SESSION['rola'] !== 'administrator') {
    http_response_code(403);
    exit(json_encode(['error' => 'Brak uprawnień administratora']));
}

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'list') {
    $stmt = $pdo->query("SELECT id, nazwa_uzytkownika, rola, data_dolaczenia FROM st_uzytkownicy ORDER BY data_dolaczenia DESC");
    echo json_encode($stmt->fetchAll());
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $userId = $_POST['user_id'] ?? null;

    if ($action === 'update_role') {
        $newRole = $_POST['role'] ?? 'uzytkownik';

        // Nie pozwól sobie samemu odebrać admina (bezpiecznik)
        if ($userId == $_SESSION['id_uzytkownika'] && $newRole !== 'administrator') {
            exit(json_encode(['error' => 'Nie możesz odebrać sobie uprawnień administratora!']));
        }

        $stmt = $pdo->prepare("UPDATE st_uzytkownicy SET rola = ? WHERE id = ?");
        $stmt->execute([$newRole, $userId]);
        echo json_encode(['success' => true]);
    }

    if ($action === 'delete') {
        // Nie pozwól usunąć samego siebie
        if ($userId == $_SESSION['id_uzytkownika']) {
            exit(json_encode(['error' => 'Nie możesz usunąć własnego konta z tego panelu!']));
        }

        $stmt = $pdo->prepare("DELETE FROM st_uzytkownicy WHERE id = ?");
        $stmt->execute([$userId]);
        echo json_encode(['success' => true]);
    }
}