<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    echo json_encode([
        'loggedIn' => true,
        'user_id' => (int)$_SESSION['user_id'], // Rzutowanie na int
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role']
    ]);
} else {
    echo json_encode(['loggedIn' => false, 'role' => 'gosc']);
}