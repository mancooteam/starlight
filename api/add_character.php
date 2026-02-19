<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['status' => 'error', 'message' => 'Zaloguj się, aby dodać postać!']));
}

$data = json_decode(file_get_contents('php://input'), true);

if (empty($data['id_postaci']) || empty($data['imie'])) {
    die(json_encode(['status' => 'error', 'message' => 'ID i Imię są wymagane!']));
}

try {
    // Sprawdzenie unikalności ID
    $check = $pdo->prepare("SELECT id_postaci FROM st_postacie WHERE id_postaci = ?");
    $check->execute([$data['id_postaci']]);
    if ($check->fetch()) {
        die(json_encode(['status' => 'error', 'message' => 'To ID postaci jest już zajęte!']));
    }

    // Pełne zapytanie na 20 kolumn (1 id_wlasciciela + 19 z danych)
    $sql = "INSERT INTO st_postacie (
        id_postaci, id_wlasciciela, imie, ranga, klan, plec, opis, url_awatara,
        sila, zrecznosc, szybkosc, odpornosc, hp, wytrzymalosc,
        u_lowienie, u_plywanie, u_skradanie, u_tropienie, u_wspinaczka, u_zielarstwo
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['id_postaci'],
        $_SESSION['user_id'],
        $data['imie'],
        $data['ranga'],
        $data['klan'],
        $data['plec'],
        $data['opis'],
        $data['url_awatara'],
        $data['sila'],
        $data['zrecznosc'],
        $data['szybkosc'],
        $data['odpornosc'],
        $data['hp'],
        $data['wytrzymalosc'],
        $data['u_lowienie'],
        $data['u_plywanie'],
        $data['u_skradanie'],
        $data['u_tropienie'],
        $data['u_wspinaczka'],
        $data['u_zielarstwo']
    ]);

    echo json_encode(['status' => 'success']);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Błąd SQL: ' . $e->getMessage()]);
}