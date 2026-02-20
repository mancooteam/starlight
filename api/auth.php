<?php
require_once 'db.php';

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $data = json_decode(file_get_contents('php://input'), true);
    $login = $data['login'] ?? '';
    $pass = $data['password'] ?? '';

    $stmt = $pdo->prepare("SELECT * FROM uzytkownicy WHERE login = ?");
    $stmt->execute([$login]);
    $user = $stmt->fetch();

    // UWAGA: W bazie hasła powinny być zahashowane przez password_hash()
    // Tutaj używamy password_verify()
    if ($user && password_verify($pass, $user['haslo'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['role'] = $user['rola'];
        $_SESSION['login'] = $user['login'];
        echo json_encode(['status' => 'success']);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Błędny login lub hasło']);
    }
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['status' => 'success']);
}