<?php
require_once 'db_connect.php';
header('Content-Type: application/json');
echo json_encode([
    'loggedIn' => isset($_SESSION['user_id']),
    'user_id' => $_SESSION['user_id'] ?? null,
    'username' => $_SESSION['username'] ?? null,
    'role' => $_SESSION['role'] ?? 'gosc'
]);