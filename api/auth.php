<?php
require_once 'db_connect.php';
header('Content-Type: application/json');
$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

if ($action === 'register') {
    $user = trim($data['username']);
    $pass = password_hash($data['password'], PASSWORD_DEFAULT);
    $ava  = $data['url_awatara'] ?: 'https://via.placeholder.com/150';
    try {
        $stmt = $pdo->prepare("INSERT INTO st_uzytkownicy (nazwa_uzytkownika, haslo, rola, url_awatara) VALUES (?, ?, 'uzytkownik', ?)");
        $stmt->execute([$user, $pass, $ava]);
        echo json_encode(['success' => 'Konto utworzone!']);
    } catch (Exception $e) { echo json_encode(['error' => 'Nazwa użytkownika zajęta']); }
}
elseif ($action === 'login') {
    $stmt = $pdo->prepare("SELECT * FROM st_uzytkownicy WHERE nazwa_uzytkownika = ?");
    $stmt->execute([trim($data['username'])]);
    $u = $stmt->fetch();
    if ($u && password_verify($data['password'], $u['haslo'])) {
        $_SESSION['id_uzytkownika'] = $u['id'];
        $_SESSION['nazwa_uzytkownika'] = $u['nazwa_uzytkownika'];
        $_SESSION['rola'] = $u['rola'];
        echo json_encode(['success' => 'Zalogowano']);
    } else { echo json_encode(['error' => 'Błędny login lub hasło']); }
}
elseif ($action === 'status') {
    echo json_encode([
        'loggedIn' => isset($_SESSION['id_uzytkownika']),
        'id' => $_SESSION['id_uzytkownika'] ?? null,
        'nazwa' => $_SESSION['nazwa_uzytkownika'] ?? null,
        'rola' => $_SESSION['rola'] ?? 'gosc'
    ]);
}
elseif ($action === 'logout') { session_destroy(); echo json_encode(['success' => 'Wylogowano']); }