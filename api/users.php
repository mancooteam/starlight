<?php
// api/users.php
require_once 'db_connect.php';

header('Content-Type: application/json');

// Bardzo ważne: Tylko admin ma tu wstęp
if (!isset($_SESSION['rola']) || $_SESSION['rola'] !== 'administrator') {
    http_response_code(403);
    echo json_encode(['error' => 'Brak uprawnień administratora.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// --- POBIERANIE LISTY UZYTKOWNIKÓW ---
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT id, nazwa_uzytkownika, rola, url_awatara FROM st_uzytkownicy ORDER BY id DESC");
    echo json_encode($stmt->fetchAll());
}

// --- AKTUALIZACJA ROLI LUB USUNIĘCIE ---
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true) ?? $_POST;
    $action = $data['action'] ?? '';
    $userId = $data['user_id'] ?? null;

    if (!$userId) {
        echo json_encode(['error' => 'Brak ID użytkownika']);
        exit;
    }

    if ($action === 'change_role') {
        $newRole = $data['new_role'];
        // Zabezpieczenie: nie pozwól zmienić roli samemu sobie (opcjonalnie)
        if ($userId == $_SESSION['id_uzytkownika'] && $newRole !== 'administrator') {
             echo json_encode(['error' => 'Nie możesz odebrać sobie uprawnień administratora!']);
             exit;
        }

        $stmt = $pdo->prepare("UPDATE st_uzytkownicy SET rola = ? WHERE id = ?");
        $stmt->execute([$newRole, $userId]);
        echo json_encode(['success' => 'Rola została zmieniona.']);

    } elseif ($action === 'delete_user') {
        // Zabezpieczenie: nie pozwól usunąć samego siebie
        if ($userId == $_SESSION['id_uzytkownika']) {
            echo json_encode(['error' => 'Nie możesz usunąć własnego konta z tego poziomu.']);
            exit;
        }

        $stmt = $pdo->prepare("DELETE FROM st_uzytkownicy WHERE id = ?");
        $stmt->execute([$userId]);
        echo json_encode(['success' => 'Użytkownik został usunięty.']);
    }
}