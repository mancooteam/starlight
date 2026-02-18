<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['rola']) || $_SESSION['rola'] !== 'administrator') {
    http_response_code(403);
    exit(json_encode(['error' => 'Brak uprawnień']));
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    echo json_encode($pdo->query("SELECT id, nazwa_uzytkownika, rola, url_awatara FROM st_uzytkownicy")->fetchAll());
}

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    if ($data['action'] === 'change_role') {
        $pdo->prepare("UPDATE st_uzytkownicy SET rola = ? WHERE id = ?")->execute([$data['new_role'], $data['user_id']]);
        echo json_encode(['success' => 'Rola zmieniona']);
    } elseif ($data['action'] === 'delete_user') {
        $pdo->prepare("DELETE FROM st_uzytkownicy WHERE id = ?")->execute([$data['user_id']]);
        echo json_encode(['success' => 'Użytkownik usunięty']);
    }
}