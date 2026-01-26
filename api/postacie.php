<?php
    require "db.php";

    $conexion = getDBConnection();

    $sql = "SELECT * FROM st_postac;";
    $result = mysqli_query($conexion, $sql);

    if($result) {
        $datos = array();
            while($fila = mysqli_fetch_array($result)){
                $datos[] = [
                    'id'        => $fila['id'],
                    'imie'        => $fila['imie'],
                    'klan'    => $fila['klan'],
                    'ranga' => $fila['ranga'],
                    'avek'     => $fila['avek'],
                    'plec' => $fila['plec']
                ];
            }
        $res = [
            "valid" => true,
            "data" => $datos
        ];
    } else {
        $res = [
            "valid" => false,
            "data" => "Błąd podczas zdobywania danych"
        ];
    }

    header('Content-Type: application/json');
    echo json_encode($res);

    mysqli_close($conexion);