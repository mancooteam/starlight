<?php
require_once 'db_connect.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Nie jesteś zalogowany']);
    exit;
}

$imie = $_POST['imie'] ?? '';
$klan = $_POST['klan'] ?? '';
$ranga = $_POST['ranga'] ?? '';
$avatar = $_POST['url_awatara'] ?? '';
$cechy = $_POST['cechy'] ?? []; // Tablica ID cech
$id_postaci = uniqid('char_'); // Unikalny ID tekstowy zgodnie z Twoją bazą

try {
    $pdo->beginTransaction();

    // 1. Dodaj postać
    $stmt = $pdo->prepare("INSERT INTO postacie (id_postaci, id_wlasciciela, imie, klan, ranga, url_awatara) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$id_postaci, $_SESSION['user_id'], $imie, $klan, $ranga, $avatar]);

    // 2. Dodaj cechy do tabeli łączącej
    $stmt_cecha = $pdo->prepare("INSERT INTO st_postacie_cechy (id_postaci, id_cechy) VALUES (?, ?)");
    foreach ($cechy as $id_cechy) {
        $stmt_cecha->execute([$id_postaci, $id_cechy]);
    }

    $pdo->commit();
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    $pdo->rollBack();
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}