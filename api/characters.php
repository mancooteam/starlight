<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['id_uzytkownika'] ?? null; // ID z sesji

if ($method === 'GET') {
    // Widok "Moje Postacie" lub "Inne postacie autora"
    if (isset($_GET['owner_id'])) {
        $stmt = $pdo->prepare("SELECT id_postaci, imie, url_awatara, ranga, klan FROM st_postacie WHERE id_wlasciciela = ?");
        $stmt->execute([$_GET['owner_id']]);
        echo json_encode($stmt->fetchAll());
    }
    // Szczegóły jednej postaci
    elseif (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
        $stmt->execute([$_GET['id']]);
        echo json_encode($stmt->fetch() ?: ['error' => 'Nie znaleziono']);
    }
    // Wszystkie postacie
    else {
        echo json_encode($pdo->query("SELECT * FROM st_postacie ORDER BY imie ASC")->fetchAll());
    }
}

if ($method === 'POST') {
    if (!$userId) {
        http_response_code(401);
        exit(json_encode(['error' => 'Musisz być zalogowany']));
    }

    $id = $_POST['id_postaci'];

    // Sprawdzamy, czy postać już istnieje
    $check = $pdo->prepare("SELECT id_wlasciciela FROM st_postacie WHERE id_postaci = ?");
    $check->execute([$id]);
    $existingChar = $check->fetch();

    if ($existingChar) {
        // EDYCJA: Tylko właściciel lub admin
        if ($existingChar['id_wlasciciela'] != $userId && $_SESSION['rola'] !== 'administrator') {
            exit(json_encode(['error' => 'To nie jest Twoja postać!']));
        }

        $sql = "UPDATE st_postacie SET imie=?, ranga=?, klan=?, plec=?, opis=?, url_awatara=?, sila=?, zrecznosc=?, szybkosc=?, odpornosc=?, hp=?, wytrzymalosc=? WHERE id_postaci=?";
        $params = [$_POST['imie'], $_POST['ranga'], $_POST['klan'], $_POST['plec'], $_POST['opis'], $_POST['url_awatara'], (int)$_POST['sila'], (int)$_POST['zrecznosc'], (int)$_POST['szybkosc'], (int)$_POST['odpornosc'], (int)$_POST['hp'], (int)$_POST['wytrzymalosc'], $id];
    } else {
        // TWORZENIE NOWEJ: Tutaj MUSIMY dodać $userId
        $sql = "INSERT INTO st_postacie (imie, ranga, klan, plec, opis, url_awatara, sila, zrecznosc, szybkosc, odpornosc, hp, wytrzymalosc, id_postaci, id_wlasciciela) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        $params = [$_POST['imie'], $_POST['ranga'], $_POST['klan'], $_POST['plec'], $_POST['opis'], $_POST['url_awatara'], (int)$_POST['sila'], (int)$_POST['zrecznosc'], (int)$_POST['szybkosc'], (int)$_POST['odpornosc'], (int)$_POST['hp'], (int)$_POST['wytrzymalosc'], $id, $userId];
    }

    $pdo->prepare($sql)->execute($params);
    echo json_encode(['success' => 'Zapisano pomyślnie']);
}