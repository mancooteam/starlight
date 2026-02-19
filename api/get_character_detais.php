<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? '';
if (empty($id)) die(json_encode(['status' => 'error', 'message' => 'Brak ID']));

try {
    // 1. Pobierz dane głównej postaci
    $stmt = $pdo->prepare("SELECT * FROM st_postacie WHERE id_postaci = ?");
    $stmt->execute([$id]);
    $character = $stmt->fetch();

    if (!$character) die(json_encode(['status' => 'error', 'message' => 'Postać nie istnieje']));

    // 2. Pobierz cechy przypisane do tej postaci
    $traitStmt = $pdo->prepare("
        SELECT c.nazwa, c.typ
        FROM st_cechy c
        JOIN st_postacie_cechy pc ON c.id = pc.id_cechy
        WHERE pc.id_postaci = ?
    ");
    $traitStmt->execute([$id]);
    $traits = $traitStmt->fetchAll();

    // 3. Pobierz inne postacie tego samego użytkownika
    $stmtOther = $pdo->prepare("SELECT id_postaci, imie, url_awatara, klan FROM st_postacie WHERE id_wlasciciela = ? AND id_postaci != ?");
    $stmtOther->execute([$character['id_wlasciciela'], $id]);
    $otherCharacters = $stmtOther->fetchAll();

    echo json_encode([
        'status' => 'success',
        'character' => $character,
        'traits' => $traits,
        'other_characters' => $otherCharacters,
        'viewer' => [
            'is_owner' => (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $character['id_wlasciciela']),
            'is_admin' => (isset($_SESSION['rola']) && $_SESSION['rola'] === 'administrator')
        ]
    ]);
} catch (Exception $e) { echo json_encode(['status' => 'error', 'message' => $e->getMessage()]); }