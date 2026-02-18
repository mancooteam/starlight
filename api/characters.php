<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_SESSION['id_uzytkownika'] ?? null;

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
        $stmt->execute([$_GET['id']]);
        $char = $stmt->fetch();

        if ($char) {
            // Pobieranie cech z nazwą i typem
            $s = $pdo->prepare("SELECT c.id, c.nazwa, c.typ FROM st_cechy c
                                JOIN st_postacie_cechy pc ON c.id = pc.id_cechy
                                WHERE pc.id_postaci = ?");
            $s->execute([$_GET['id']]);
            $char['cechy'] = $s->fetchAll();
        }
        echo json_encode($char ?: ['error' => 'Nie znaleziono']);
    }
    elseif (isset($_GET['owner_id'])) {
        $stmt = $pdo->prepare("SELECT id_postaci, imie, url_awatara, ranga, klan FROM st_postacie WHERE id_wlasciciela = ?");
        $stmt->execute([$_GET['owner_id']]);
        echo json_encode($stmt->fetchAll());
    }
    else {
        echo json_encode($pdo->query("SELECT * FROM st_postacie ORDER BY imie ASC")->fetchAll());
    }
}
// Sekcja POST pozostaje bez zmian (obsługuje 18 parametrów)

if ($method === 'POST') {
    if (!$userId) exit(json_encode(['error' => 'Brak autoryzacji']));

    $id = $_POST['id_postaci'];
    $stmt = $pdo->prepare("SELECT id_wlasciciela FROM st_postacie WHERE id_postaci = ?");
    $stmt->execute([$id]);
    $exist = $stmt->fetch();

    if ($exist && $exist['id_wlasciciela'] != $userId && $role !== 'administrator') {
        exit(json_encode(['error' => 'Brak uprawnień']));
    }

    $sql = ($exist) ?
        "UPDATE st_postacie SET imie=?, ranga=?, klan=?, plec=?, opis=?, url_awatara=?, sila=?, zrecznosc=?, szybkosc=?, odpornosc=?, hp=?, wytrzymalosc=?, u_lowienie=?, u_plywanie=?, u_skradanie=?, u_tropienie=?, u_wspinaczka=?, u_zielarstwo=? WHERE id_postaci=?" :
        "INSERT INTO st_postacie (imie, ranga, klan, plec, opis, url_awatara, sila, zrecznosc, szybkosc, odpornosc, hp, wytrzymalosc, u_lowienie, u_plywanie, u_skradanie, u_tropienie, u_wspinaczka, u_zielarstwo, id_postaci, id_wlasciciela) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    $params = [
        $_POST['imie'], $_POST['ranga'], $_POST['klan'], $_POST['plec'], $_POST['opis'], $_POST['url_awatara'],
        (int)$_POST['sila'], (int)$_POST['zrecznosc'], (int)$_POST['szybkosc'], (int)$_POST['odpornosc'], (int)$_POST['hp'], (int)$_POST['wytrzymalosc'],
        (int)$_POST['u_lowienie'], (int)$_POST['u_plywanie'], (int)$_POST['u_skradanie'], (int)$_POST['u_tropienie'], (int)$_POST['u_wspinaczka'], (int)$_POST['u_zielarstwo'],
        $id
    ];
    if (!$exist) $params[] = $userId;

    try {
        $pdo->beginTransaction();
        $pdo->prepare($sql)->execute($params);
        $pdo->prepare("DELETE FROM st_postacie_cechy WHERE id_postaci = ?")->execute([$id]);
        if (!empty($_POST['cechy'])) {
            $s = $pdo->prepare("INSERT INTO st_postacie_cechy (id_postaci, id_cechy) VALUES (?, ?)");
            foreach ($_POST['cechy'] as $tId) $s->execute([$id, $tId]);
        }
        $pdo->commit();
        echo json_encode(['success' => 'Zapisano pomyślnie!']);
    } catch (Exception $e) { $pdo->rollBack(); echo json_encode(['error' => $e->getMessage()]); }
}