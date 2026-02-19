<?php
// Włączamy raportowanie błędów, żeby widzieć je w konsoli przeglądarki
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once 'db_connect.php';
header('Content-Type: application/json');

$response = [
    'status' => 'error',
    'message' => 'Nieznany błąd',
    'chars' => [],
    'session' => [
        'isLoggedIn' => isset($_SESSION['user_id']),
        'user_id' => $_SESSION['user_id'] ?? null,
        'role' => $_SESSION['rola'] ?? 'gosc'
    ]
];

try {
    // Sprawdzamy, czy połączenie z bazy (z db_connect.php) istnieje
    if (!isset($pdo)) {
        throw new Exception("Brak połączenia z bazą danych (zmienna \$pdo nie istnieje).");
    }

    // Pobieramy dane z tabeli st_postacie
    $stmt = $pdo->query("SELECT id_postaci, imie, ranga, klan, url_awatara, id_wlasciciela FROM st_postacie");
    $response['chars'] = $stmt->fetchAll();
    $response['status'] = 'success';
    $response['message'] = 'Pobrano dane';

} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);