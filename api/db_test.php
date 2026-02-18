<?php
// api/test_db.php
require_once 'db_connect.php';

header('Content-Type: application/json');

try {
    // Proste zapytanie sprawdzające połączenie
    $stmt = $pdo->query("SELECT 1 as connection_test");
    $result = $stmt->fetch();

    if ($result && $result['connection_test'] == 1) {
        echo json_encode([
            'status' => 'success',
            'message' => 'Połączono pomyślnie z Aiven Cloud!',
            'details' => [
                'host' => getenv('DB_HOST'),
                'database' => getenv('DB_NAME'),
                'ssl_active' => !empty(getenv('MYSQL_ATTR_SSL_CA')) ? 'Tak' : 'Nie'
            ]
        ]);
    }
} catch (PDOException $e) {
    echo json_encode([
        'status' => 'error',
        'message' => 'Połączenie nieudane',
        'debug_info' => $e->getMessage()
    ]);
}
?>