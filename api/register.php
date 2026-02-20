<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!empty($data['username']) && !empty($data['password'])) {
    $passHash = password_hash($data['password'], PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO st_uzytkownicy (nazwa_uzytkownika, haslo, rola) VALUES (?, ?, 'uzytkownik')");
        $stmt->execute([$data['username'], $passHash]);
        echo json_encode(['success' => true]);
    } catch (PDOException $e) {
        echo json_encode(['success' => false, 'error' => 'Nazwa użytkownika jest już zajęta.']);
    }
}