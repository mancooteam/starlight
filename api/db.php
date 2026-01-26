<?php

function getDBConnection() {
    // Extraer variables de entorno
    $host = getenv('DB_HOST');
    $port = getenv('DB_PORT');
    $db   = getenv('DB_NAME');
    $user = getenv('DB_USER');
    $pass = getenv('DB_PASS');
    $ca_content = getenv('MYSQL_ATTR_SSL_CA');

    if (!$ca_content) {
        die("Error: La variable MYSQL_ATTR_SSL_CA está vacía.");
    }

    $temp_ca = tempnam(sys_get_temp_dir(), 'aiven_');
    file_put_contents($temp_ca, $ca_content);

    $conexion = mysqli_init();

    mysqli_ssl_set($conexion, NULL, NULL, $temp_ca, NULL, NULL);

    $resultado = mysqli_real_connect(
        $conexion,
        $host,
        $user,
        $pass,
        $db,
        $port,
        NULL,
        MYSQLI_CLIENT_SSL
    );
    if (file_exists($temp_ca)) {
        unlink($temp_ca);
    }
    if (!$resultado) {
        die("Error de conexión: " . mysqli_connect_error());
    }

    return $conexion;
}