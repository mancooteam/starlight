<?php
require_once 'db_connect.php';
session_destroy();
header('Content-Type: application/json');
echo json_encode(['success' => true]);