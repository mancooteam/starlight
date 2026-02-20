<?php
// Włączamy sesje dla całego systemu
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Dane z Env Variables (Render)
$host = getenv('DB_HOST');
$db   = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$port = getenv('DB_PORT') ?: '3306';
$ssl_ca_content = getenv('MYSQL_ATTR_SSL_CA');

$dsn = "mysql:host=$host;dbname=$db;port=$port;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

// Obsługa certyfikatu SSL dla Aiven
if ($ssl_ca_content) {
    $temp_ca = '/tmp/aiven_ca.pem';
    if (!file_exists($temp_ca)) {
        file_put_contents($temp_ca, $ssl_ca_content);
    }
    $options[PDO::MYSQL_ATTR_SSL_CA] = $temp_ca;
    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    // W produkcji lepiej nie wyświetlać $e->getMessage()
    header('Content-Type: application/json', true, 500);
    echo json_encode(['error' => 'Błąd połączenia z bazą danych Aiven.']);
    exit;
}