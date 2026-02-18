<?php
// api/db_connect.php
session_start();

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

// Obsługa SSL dla Aiven Cloud
if (!empty($ssl_ca_content)) {
    // Render nie pozwala na stały zapis plików, używamy /tmp/
    $ssl_file = '/tmp/aiven-ca.pem';

    // Zapisujemy certyfikat do pliku przy każdym żądaniu (lub sprawdzamy czy jest)
    file_put_contents($ssl_file, $ssl_ca_content);

    $options[PDO::MYSQL_ATTR_SSL_CA] = $ssl_file;
    // Niektóre bazy cloud wymagają wyłączenia weryfikacji nazwy hosta, jeśli certyfikat jest ogólny
    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (\PDOException $e) {
    header('Content-Type: application/json');
    // Logowanie błędu do logów serwera (nie dla użytkownika)
    error_log("Błąd bazy: " . $e->getMessage());
    echo json_encode(['error' => 'Błąd połączenia z Aiven Cloud. Sprawdź SSL i uprawnienia IP.']);
    exit;
}