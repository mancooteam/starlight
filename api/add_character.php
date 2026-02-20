<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Musisz być zalogowany.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

try {
    $pdo->beginTransaction();

    // 1. Wstawienie podstawowych danych postaci
    $stmt = $pdo->prepare("INSERT INTO st_postacie
        (id_postaci, id_wlasciciela, imie, ranga, klan, plec, opis, url_awatara, sila, zrecznosc, szybkosc, odpornosc, hp, wytrzymalosc)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");

    // Generujemy unikalne ID tekstowe lub bierzemy z frontendu
    $char_id = uniqid('char_');

    $stmt->execute([
        $char_id,
        $_SESSION['user_id'],
        $data['imie'],
        $data['ranga'],
        $data['klan'],
        $data['plec'],
        $data['opis'],
        $data['url_awatara'],
        (int)$data['sila'],
        (int)$data['zrecznosc'],
        (int)$data['szybkosc'],
        (int)$data['odpornosc'],
        (int)$data['hp'],
        (int)$data['wytrzymalosc']
    ]);

    // 2. Wstawienie cech
    if (!empty($data['cechy'])) {
        $stmtCechy = $pdo->prepare("INSERT INTO st_postacie_cechy (id_postaci, id_cechy) VALUES (?, ?)");
        foreach ($data['cechy'] as $id_cechy) {
            $stmtCechy->execute([$char_id, $id_cechy]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}