<?php
require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM st_postacie ORDER BY imie ASC");
    $characters = $stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $characters,
        'user' => [
            'logged_in' => isset($_SESSION['user_id']),
            'id' => $_SESSION['user_id'] ?? null,
            'role' => $_SESSION['rola'] ?? 'gosc'
        ]
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}