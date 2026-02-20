<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$action = $_GET['action'] ?? '';

if ($action === 'login') {
    $user = $_POST['username'] ?? '';
    $pass = $_POST['password'] ?? '';

    $stmt = $pdo->prepare("SELECT id, nazwa_uzytkownika, haslo, rola FROM st_uzytkownicy WHERE nazwa_uzytkownika = ?");
    $stmt->execute([$user]);
    $u = $stmt->fetch();

    if ($u && password_verify($pass, $u['haslo'])) {
        $_SESSION['id_uzytkownika'] = $u['id'];
        $_SESSION['nazwa'] = $u['nazwa_uzytkownika'];
        $_SESSION['rola'] = $u['rola'];
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['error' => 'Błędne dane logowania']);
    }
}

if ($action === 'register') {
    $user = $_POST['username'] ?? '';
    $pass = password_hash($_POST['password'] ?? '', PASSWORD_DEFAULT);

    try {
        $stmt = $pdo->prepare("INSERT INTO st_uzytkownicy (nazwa_uzytkownika, haslo) VALUES (?, ?)");
        $stmt->execute([$user, $pass]);
        echo json_encode(['success' => true]);
    } catch (Exception $e) {
        echo json_encode(['error' => 'Nazwa użytkownika jest zajęta']);
    }
}

if ($action === 'status') {
    echo json_encode([
        'loggedIn' => isset($_SESSION['id_uzytkownika']),
        'id' => $_SESSION['id_uzytkownika'] ?? null,
        'nazwa' => $_SESSION['nazwa'] ?? '',
        'rola' => $_SESSION['rola'] ?? 'uzytkownik'
    ]);
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
}