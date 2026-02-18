<?php
// api/auth.php
require_once 'db_connect.php';

header('Content-Type: application/json');

$action = $_GET['action'] ?? '';
$data = json_decode(file_get_contents('php://input'), true) ?? $_POST;

switch ($action) {
    // --- REJESTRACJA ---
    case 'register':
        $username = trim($data['username']);
        $password = password_hash($data['password'], PASSWORD_DEFAULT);
        $avatar   = $data['url_awatara'] ?? 'https://via.placeholder.com/150';

        try {
            $stmt = $pdo->prepare("INSERT INTO st_uzytkownicy (nazwa_uzytkownika, haslo, rola, url_awatara) VALUES (?, ?, 'uzytkownik', ?)");
            $stmt->execute([$username, $password, $avatar]);
            echo json_encode(['success' => 'Konto utworzone! Możesz się zalogować.']);
        } catch (PDOException $e) {
            echo json_encode(['error' => 'Nazwa użytkownika jest już zajęta.']);
        }
        break;

    // --- LOGOWANIE ---
    case 'login':
        $username = trim($data['username']);
        $password = $data['password'];

        $stmt = $pdo->prepare("SELECT * FROM st_uzytkownicy WHERE nazwa_uzytkownika = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch();

        if ($user && password_verify($password, $user['haslo'])) {
            $_SESSION['id_uzytkownika'] = $user['id'];
            $_SESSION['nazwa_uzytkownika'] = $user['nazwa_uzytkownika'];
            $_SESSION['rola'] = $user['rola'];

            echo json_encode([
                'success' => 'Zalogowano pomyślnie',
                'user' => [
                    'id' => $user['id'],
                    'nazwa' => $user['nazwa_uzytkownika'],
                    'rola' => $user['rola']
                ]
            ]);
        } else {
            echo json_encode(['error' => 'Błędny login lub hasło.']);
        }
        break;

    // --- SPRAWDZANIE STATUSU (Dla JS) ---
    case 'status':
        if (isset($_SESSION['id_uzytkownika'])) {
            echo json_encode([
                'loggedIn' => true,
                'id' => $_SESSION['id_uzytkownika'],
                'nazwa' => $_SESSION['nazwa_uzytkownika'],
                'rola' => $_SESSION['rola']
            ]);
        } else {
            echo json_encode(['loggedIn' => false, 'rola' => 'gosc']);
        }
        break;

    // --- WYLOGOWANIE ---
    case 'logout':
        session_destroy();
        echo json_encode(['success' => 'Wylogowano']);
        break;

    default:
        echo json_encode(['error' => 'Nieznana akcja']);
        break;
}