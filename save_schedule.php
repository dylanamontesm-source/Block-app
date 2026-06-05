<?php
header('Content-Type: application/json; charset=UTF-8');

$host = '127.0.0.1';
$user = 'root';
$password = '';
$database = 'horarios';

$mysqli = new mysqli($host, $user, $password, $database);
if ($mysqli->connect_errno) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión a la base de datos: ' . $mysqli->connect_error]);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input) || !isset($input['inicio'], $input['fin'], $input['days'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Faltan datos del horario.']);
    exit;
}

$horaInicio = $mysqli->real_escape_string(trim($input['inicio']));
$horaFin = $mysqli->real_escape_string(trim($input['fin']));
$dias = is_array($input['days']) ? implode(', ', $input['days']) : trim($input['days']);
$dias = $mysqli->real_escape_string($dias);

$sql = "INSERT INTO horarios (hora_inicio, hora_fin, dias, fecha_creacion) VALUES ('$horaInicio', '$horaFin', '$dias', NOW())";
if (!$mysqli->query($sql)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar el horario: ' . $mysqli->error]);
    exit;
}

echo json_encode(['success' => true, 'message' => 'Horario guardado en la base de datos.']);
$mysqli->close();
