<?php
require_once 'db_connect.php';
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) die(json_encode(['status' => 'error']));

$data = json_decode(file_get_contents('php://input'), true);

try {
    // Ponowne sprawdzenie uprawnień
    $check = $pdo->prepare("SELECT id_wlasciciela FROM st_postacie WHERE id_postaci = ?");
    $check->execute([$data['id_postaci']]);
    $char = $check->fetch();

    if (!$char || ($char['id_wlasciciela'] != $_SESSION['user_id'] && $_SESSION['rola'] !== 'administrator')) {
        die(json_encode(['status' => 'error', 'message' => 'Brak uprawnień!']));
    }

    $sql = "UPDATE st_postacie SET
            imie = ?, ranga = ?, klan = ?, plec = ?, opis = ?, url_awatara = ?,
            sila = ?, zrecznosc = ?, szybkosc = ?, odpornosc = ?, hp = ?, wytrzymalosc = ?,
            u_lowienie = ?, u_plywanie = ?, u_skradanie = ?, u_tropienie = ?, u_wspinaczka = ?, u_zielarstwo = ?
            WHERE id_postaci = ?";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $data['imie'], $data['ranga'], $data['klan'], $data['plec'], $data['opis'], $data['url_awatara'],
        (int)$data['sila'], (int)$data['zrecznosc'], (int)$data['szybkosc'], (int)$data['odpornosc'],
        (int)$data['hp'], (int)$data['wytrzymalosc'], (int)$data['u_lowienie'], (int)$data['u_plywanie'],
        (int)$data['u_skradanie'], (int)$data['u_tropienie'], (int)$data['u_wspinaczka'], (int)$data['u_zielarstwo'],
        $data['id_postaci']
    ]);

    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}