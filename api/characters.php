<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$role = $_SESSION['rola'] ?? 'gosc';
$userId = $_SESSION['id_uzytkownika'] ?? null;

if ($method === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'get_all_traits') {
        echo json_encode($pdo->query("SELECT * FROM st_cechy ORDER BY nazwa ASC")->fetchAll());
    } elseif (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
        $stmt->execute([$_GET['id']]);
        $char = $stmt->fetch();
        if ($char) {
            $s = $pdo->prepare("SELECT c.nazwa, c.typ FROM st_cechy c JOIN st_postacie_cechy pc ON c.id = pc.id_cechy WHERE pc.id_postaci = ?");
            $s->execute([$_GET['id']]);
            $char['cechy'] = $s->fetchAll();
        }
        echo json_encode($char);
    } elseif (isset($_GET['owner_id'])) {
        $stmt = $pdo->prepare("SELECT id_postaci, imie, url_awatara, ranga FROM st_postacie WHERE id_wlasciciela = ?");
        $stmt->execute([$_GET['owner_id']]);
        echo json_encode($stmt->fetchAll());
    } else {
        echo json_encode($pdo->query("SELECT id_postaci, imie, ranga, klan, url_awatara FROM st_postacie")->fetchAll());
    }
}

if ($method === 'POST') {
    if ($role === 'gosc') exit(json_encode(['error' => 'Brak autoryzacji']));

    $id = $_POST['id_postaci'];
    $stmt = $pdo->prepare("SELECT id_wlasciciela FROM st_postacie WHERE id_postaci = ?");
    $stmt->execute([$id]);
    $exist = $stmt->fetch();

    if ($exist && $exist['id_wlasciciela'] != $userId && $role !== 'administrator') {
        exit(json_encode(['error' => 'Brak uprawnień']));
    }

    $sql = ($exist) ?
        "UPDATE st_postacie SET imie=?, ranga=?, klan=?, plec=?, opis=?, url_awatara=?, sila=?, zrecznosc=?, szybkosc=?, odpornosc=?, hp=?, wytrzymalosc=? WHERE id_postaci=?" :
        "INSERT INTO st_postacie (imie, ranga, klan, plec, opis, url_awatara, sila, zrecznosc, szybkosc, odpornosc, hp, wytrzymalosc, id_postaci, id_wlasciciela) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

    $params = [$_POST['imie'], $_POST['ranga'], $_POST['klan'], $_POST['plec'], $_POST['opis'], $_POST['url_awatara'], (int)$_POST['sila'], (int)$_POST['zrecznosc'], (int)$_POST['szybkosc'], (int)$_POST['odpornosc'], (int)$_POST['hp'], (int)$_POST['wytrzymalosc'], $id];
    if (!$exist) $params[] = $userId;

    $pdo->prepare($sql)->execute($params);

    $pdo->prepare("DELETE FROM st_postacie_cechy WHERE id_postaci = ?")->execute([$id]);
    if (isset($_POST['cechy'])) {
        $s = $pdo->prepare("INSERT INTO st_postacie_cechy (id_postaci, id_cechy) VALUES (?, ?)");
        foreach ($_POST['cechy'] as $tid) $s->execute([$id, $tid]);
    }
    echo json_encode(['success' => 'Zapisano pomyślnie!']);
}