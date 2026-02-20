<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

session_start();

$data = json_decode(file_get_contents('php://input'), true);

$stmt = $pdo->prepare("SELECT * FROM st_uzytkownicy WHERE nazwa_uzytkownika = ?");
$stmt->execute([$data['username']]);
$user = $stmt->fetch();

if ($user && password_verify($data['password'], $user['haslo'])) {
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['username'] = $user['nazwa_uzytkownika'];
    $_SESSION['role'] = $user['rola'];

    echo json_encode([
        'success' => true,
        'role' => $user['rola'],
        'username' => $user['nazwa_uzytkownika']
    ]);
} else {
    echo json_encode(['success' => false, 'error' => 'Błędne dane logowania.']);
}