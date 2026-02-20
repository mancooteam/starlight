<?php
require_once 'db_connect.php';

try {
    // Pobieramy postacie wraz z ich cechami połączonymi w jeden ciąg znaków
    $query = "
        SELECT p.*,
        GROUP_CONCAT(c.nazwa SEPARATOR ', ') as cechy_listy,
        GROUP_CONCAT(c.typ SEPARATOR ', ') as cechy_typy
        FROM postacie p
        LEFT JOIN st_postacie_cechy pc ON p.id_postaci = pc.id_postaci
        LEFT JOIN st_cechy c ON pc.id_cechy = c.id
        GROUP BY p.id_postaci
    ";

    $stmt = $pdo->query($query);
    $characters = $stmt->fetchAll();

    // Pobieramy też listę wszystkich dostępnych cech do formularza
    $cechy_stmt = $pdo->query("SELECT * FROM st_cechy ORDER BY typ, nazwa");
    $wszystkie_cechy = $cechy_stmt->fetchAll();

    echo json_encode([
        'status' => 'success',
        'data' => $characters,
        'all_traits' => $wszystkie_cechy,
        'current_user' => $_SESSION['user_id'] ?? null,
        'role' => $_SESSION['role'] ?? 'guest',
        'login' => $_SESSION['login'] ?? null
    ]);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}