<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if (isset($_GET['id'])) {
        $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
        $stmt->execute([$_GET['id']]);
        $char = $stmt->fetch();
        if ($char) {
            $s = $pdo->prepare("SELECT c.nazwa, c.typ FROM st_cechy c
                                JOIN st_postacie_cechy pc ON c.id = pc.id_cechy
                                WHERE pc.id_postaci = ?");
            $s->execute([$_GET['id']]);
            $char['cechy'] = $s->fetchAll();
        }
        echo json_encode($char ?: ['error' => 'Not found']);
    } elseif (isset($_GET['owner_id'])) {
        $stmt = $pdo->prepare("SELECT id_postaci, imie, url_awatara, klan FROM st_postacie WHERE id_wlasciciela = ?");
        $stmt->execute([$_GET['owner_id']]);
        echo json_encode($stmt->fetchAll());
    } else {
        echo json_encode($pdo->query("SELECT * FROM st_postacie ORDER BY imie ASC")->fetchAll());
    }
}