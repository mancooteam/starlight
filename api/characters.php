<?php
// api/characters.php
require_once 'db_connect.php';

header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$role = $_SESSION['rola'] ?? 'gosc';
$userId = $_SESSION['id_uzytkownika'] ?? null;

// --- POBIERANIE DANYCH (GET) ---
if ($method === 'GET') {
    if (isset($_GET['action']) && $_GET['action'] === 'get_all_traits') {
        $stmt = $pdo->query("SELECT * FROM st_cechy ORDER BY nazwa ASC");
        echo json_encode($stmt->fetchAll());
        exit;
    }
    if (isset($_GET['id'])) {
        // Pobierz jedną postać + jej cechy
        $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
        $stmt->execute([$_GET['id']]);
        $char = $stmt->fetch();

        if ($char) {
            $stmtCechy = $pdo->prepare("SELECT c.nazwa, c.typ FROM st_cechy c
                                        JOIN st_postacie_cechy pc ON c.id = pc.id_cechy
                                        WHERE pc.id_postaci = ?");
            $stmtCechy->execute([$_GET['id']]);
            $char['cechy'] = $stmtCechy->fetchAll();
            echo json_encode($char);
        } else {
            echo json_encode(['error' => 'Postać nie istnieje']);
        }
    } else {
        // Pobierz listę wszystkich postaci (widok ogólny)
        $stmt = $pdo->query("SELECT id_postaci, imie, ranga, klan, url_awatara FROM st_postacie");
        echo json_encode($stmt->fetchAll());
    }
}

// --- DODAWANIE / EDYCJA (POST) ---
if ($method === 'POST') {
    if ($role === 'gosc') {
        echo json_encode(['error' => 'Musisz być zalogowany']);
        exit;
    }

    $id_postaci = $_POST['id_postaci']; // Manualne ID
    $imie = $_POST['imie'];
    $ranga = $_POST['ranga'];
    $klan = $_POST['klan'];
    $plec = $_POST['plec'];
    $opis = $_POST['opis'];
    $url_awatara = $_POST['url_awatara'] ?: 'https://via.placeholder.com/150';

    // Statystyki
    $sila = (int)$_POST['sila'];
    $zrecznosc = (int)$_POST['zrecznosc'];
    $szybkosc = (int)$_POST['szybkosc'];
    $odpornosc = (int)$_POST['odpornosc'];
    $hp = (int)$_POST['hp'];
    $wytrzymalosc = (int)$_POST['wytrzymalosc'];

    // Sprawdź, czy postać już istnieje
    $check = $pdo->prepare("SELECT id_wlasciciela FROM st_postacie WHERE id_postaci = ?");
    $check->execute([$id_postaci]);
    $existingChar = $check->fetch();

    if ($existingChar) {
        // EDYCJA: Sprawdź uprawnienia (Właściciel lub Admin)
        if ($existingChar['id_wlasciciela'] != $userId && $role !== 'administrator') {
            echo json_encode(['error' => 'Brak uprawnień do edycji tej postaci']);
            exit;
        }

        $sql = "UPDATE st_postacie SET imie=?, ranga=?, klan=?, plec=?, opis=?, url_awatara=?,
                sila=?, zrecznosc=?, szybkosc=?, odpornosc=?, hp=?, wytrzymalosc=?
                WHERE id_postaci=?";
        $pdo->prepare($sql)->execute([$imie, $ranga, $klan, $plec, $opis, $url_awatara, $sila, $zrecznosc, $szybkosc, $odpornosc, $hp, $wytrzymalosc, $id_postaci]);

        $msg = "Postać zaktualizowana";
    } else {
        // NOWA POSTAĆ
        $sql = "INSERT INTO st_postacie (id_postaci, id_wlasciciela, imie, ranga, klan, plec, opis, url_awatara, sila, zrecznosc, szybkosc, odpornosc, hp, wytrzymalosc)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $pdo->prepare($sql)->execute([$id_postaci, $userId, $imie, $ranga, $klan, $plec, $opis, $url_awatara, $sila, $zrecznosc, $szybkosc, $odpornosc, $hp, $wytrzymalosc]);

        $msg = "Postać utworzona";
    }

    // --- OBSŁUGA CECH (st_postacie_cechy) ---
    if (isset($_POST['cechy'])) {
        // Usuwamy stare i dodajemy nowe
        $pdo->prepare("DELETE FROM st_postacie_cechy WHERE id_postaci = ?")->execute([$id_postaci]);
        $stmtTrait = $pdo->prepare("INSERT INTO st_postacie_cechy (id_postaci, id_cechy) VALUES (?, ?)");
        foreach ($_POST['cechy'] as $traitId) {
            $stmtTrait->execute([$id_postaci, $traitId]);
        }
    }

    echo json_encode(['success' => $msg]);
}