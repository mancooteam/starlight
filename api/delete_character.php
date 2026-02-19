<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

// Sprawdzenie logowania
if (!isset($_SESSION['user_id'])) {
    die(json_encode(['status' => 'error', 'message' => 'Brak autoryzacji']));
}

$data = json_decode(file_get_contents('php://input'), true);
$id_postaci = $data['id_postaci'] ?? '';

try {
    // 1. Pobierz dane o właścicielu postaci
    $stmt = $pdo->prepare("SELECT id_wlasciciela FROM st_postacie WHERE id_postaci = ?");
    $stmt->execute([$id_postaci]);
    $char = $stmt->fetch();

    if (!$char) {
        die(json_encode(['status' => 'error', 'message' => 'Postać nie istnieje']));
    }

    // 2. Sprawdź uprawnienia: Admin może wszystko, użytkownik tylko swoje
    $is_admin = ($_SESSION['rola'] === 'administrator');
    $is_owner = ($char['id_wlasciciela'] == $_SESSION['user_id']);

    if (!$is_admin && !$is_owner) {
        die(json_encode(['status' => 'error', 'message' => 'Brak uprawnień do usunięcia tej postaci']));
    }

    // 3. Usuń postać
    $delete = $pdo->prepare("DELETE FROM st_postacie WHERE id_postaci = ?");
    $delete->execute([$id_postaci]);

    echo json_encode(['status' => 'success', 'message' => 'Postać została usunięta']);

} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => 'Błąd bazy: ' . $e->getMessage()]);
}