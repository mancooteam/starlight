<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'error' => 'Brak autoryzacji.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id_postaci = $data['id_postaci'] ?? '';

if (empty($id_postaci)) {
    echo json_encode(['success' => false, 'error' => 'Brak ID postaci.']);
    exit;
}

try {
    // 1. Sprawdźmy, czy postać istnieje i kto jest właścicielem
    $stmt = $pdo->prepare("SELECT id_wlasciciela FROM st_postacie WHERE id_postaci = ?");
    $stmt->execute([$id_postaci]);
    $char = $stmt->fetch();

    if (!$char) {
        echo json_encode(['success' => false, 'error' => 'Postać nie istnieje.']);
        exit;
    }

    // 2. Uprawnienia: Tylko Admin lub Właściciel
    $isAdmin = ($_SESSION['role'] === 'admin' || $_SESSION['role'] === 'administrator');
    $isOwner = ((int)$_SESSION['user_id'] === (int)$char['id_wlasciciela']);

    if (!$isAdmin && !$isOwner) {
        echo json_encode(['success' => false, 'error' => 'Nie masz uprawnień do usunięcia tej postaci.']);
        exit;
    }

    $pdo->beginTransaction();

    // 3. Usuwamy najpierw powiązane cechy (ważne ze względu na klucze obce)
    $delCechy = $pdo->prepare("DELETE FROM st_postacie_cechy WHERE id_postaci = ?");
    $delCechy->execute([$id_postaci]);

    // 4. Usuwamy postać
    $delChar = $pdo->prepare("DELETE FROM st_postacie WHERE id_postaci = ?");
    $delChar->execute([$id_postaci]);

    $pdo->commit();
    echo json_encode(['success' => true]);
} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}