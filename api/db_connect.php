<?php
session_start();
$host = getenv('DB_HOST');
$db   = getenv('DB_NAME');
$user = getenv('DB_USER');
$pass = getenv('DB_PASS');
$port = getenv('DB_PORT');
$ssl_ca = getenv('MYSQL_ATTR_SSL_CA');

$dsn = "mysql:host=$host;dbname=$db;port=$port;charset=utf8mb4";
$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

if (!empty($ssl_ca)) {
    $temp_ssl = '/tmp/aiven_ca.pem';
    file_put_contents($temp_ssl, $ssl_ca);
    $options[PDO::MYSQL_ATTR_SSL_CA] = $temp_ssl;
    $options[PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT] = false;
}

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
    die(json_encode(['error' => 'Błąd bazy danych']));
}