<?php
require_once 'db.php';

try {
    // Pobieramy podstawowe dane postaci
    $stmt = $pdo->query("SELECT id_postaci, imie, ranga, klan, url_awatara, id_wlasciciela FROM postacie");
    $characters = $stmt::fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $characters,
        'current_user' => $_SESSION['user_id'] ?? null,
        'role' => $_SESSION['role'] ?? 'guest'
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}