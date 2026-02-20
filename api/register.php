<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['username']) || empty($data['password'])) {
    echo json_encode(['success' => false, 'error' => 'Brak danych']); exit;
}

try {
    $check = $pdo->prepare("SELECT id FROM st_uzytkownicy WHERE nazwa_uzytkownika = ?");
    $check->execute([$data['username']]);
    if ($check->fetch()) {
        echo json_encode(['success' => false, 'error' => 'Nazwa zajęta']); exit;
    }

    $hash = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO st_uzytkownicy (nazwa_uzytkownika, haslo, rola) VALUES (?, ?, 'uzytkownik')");
    $stmt->execute([$data['username'], $hash]);
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}