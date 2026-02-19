<?php
require_once 'db_connect.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['username']) || empty($data['password'])) {
    die(json_encode(['status' => 'error', 'message' => 'Uzupełnij dane!']));
}

try {
    $stmt = $pdo->prepare("SELECT id FROM st_uzytkownicy WHERE nazwa_uzytkownika = ?");
    $stmt->execute([$data['username']]);
    if ($stmt->fetch()) die(json_encode(['status' => 'error', 'message' => 'Login zajęty!']));

    $hash = password_hash($data['password'], PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO st_uzytkownicy (nazwa_uzytkownika, haslo, rola) VALUES (?, ?, 'uzytkownik')");
    $stmt->execute([$data['username'], $hash]);
    echo json_encode(['status' => 'success']);
} catch (PDOException $e) { echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); }