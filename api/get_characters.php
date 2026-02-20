<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

try {
    $sql = "SELECT p.*, GROUP_CONCAT(c.nazwa SEPARATOR ', ') as cechy
            FROM st_postacie p
            LEFT JOIN st_postacie_cechy pc ON p.id_postaci = pc.id_postaci
            LEFT JOIN st_cechy c ON pc.id_cechy = c.id
            GROUP BY p.id_postaci";

    $stmt = $pdo->query($sql);
    echo json_encode($stmt->fetchAll());
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}