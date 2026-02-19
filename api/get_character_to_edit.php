<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    die(json_encode(['status' => 'error', 'message' => 'Brak autoryzacji']));
}

$id = $_GET['id'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
    $stmt->execute([$id]);
    $char = $stmt->fetch();

    if (!$char) {
        die(json_encode(['status' => 'error', 'message' => 'Postać nie istnieje']));
    }

    // Sprawdzenie uprawnień
    $is_admin = ($_SESSION['rola'] === 'administrator');
    $is_owner = ($char['id_wlasciciela'] == $_SESSION['user_id']);

    if (!$is_admin && !$is_owner) {
        die(json_encode(['status' => 'error', 'message' => 'To nie Twoja postać!']));
    }

    echo json_encode(['status' => 'success', 'data' => $char]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}