<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Brak autoryzacji']);
    exit;
}

$id = $_GET['id'] ?? '';

try {
    $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
    $stmt->execute([$id]);
    $char = $stmt->fetch();

    if (!$char) {
        echo json_encode(['status' => 'error', 'message' => 'Nie znaleziono postaci']);
        exit;
    }

    // Sprawdzenie uprawnień: Właściciel lub Admin
    if ($char['id_wlasciciela'] != $_SESSION['user_id'] && $_SESSION['rola'] !== 'administrator') {
        echo json_encode(['status' => 'error', 'message' => 'Brak uprawnień do edycji tej postaci']);
        exit;
    }

    echo json_encode(['status' => 'success', 'data' => $char]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}