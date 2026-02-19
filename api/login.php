<?php
require_once 'db_connect.php';
header('Content-Type: application/json');
$data = json_decode(file_get_contents('php://input'), true);

$stmt = $pdo->prepare("SELECT * FROM st_uzytkownicy WHERE nazwa_uzytkownika = ?");
$stmt->execute([$data['username'] ?? '']);
$user = $stmt->fetch();

if ($user && password_verify($data['password'] ?? '', $user['haslo'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['rola'] = $user['rola'];
    $_SESSION['username'] = $user['nazwa_uzytkownika'];
    echo json_encode(['status' => 'success', 'role' => $user['rola']]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Błędne dane!']);
}