<?php
require_once 'db_connect.php';
header('Content-Type: application/json');
$stmt = $pdo->query("SELECT id_postaci, imie, ranga, klan, url_awatara, id_wlasciciela FROM st_postacie");
echo json_encode([
    'chars' => $stmt->fetchAll(),
    'session' => [
        'isLoggedIn' => isset($_SESSION['user_id']),
        'user_id' => $_SESSION['user_id'] ?? null,
        'role' => $_SESSION['rola'] ?? 'gosc'
    ]
]);