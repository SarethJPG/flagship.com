<?php
// =========================================
// FORMULARIO DE CONTACTO — FLAGSHIP
// Envío vía PHPMailer + SMTP
// =========================================

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/Exception.php';
require 'PHPMailer/PHPMailer.php';
require 'PHPMailer/SMTP.php';

// Respuesta en JSON siempre
header('Content-Type: application/json; charset=utf-8');

// =========================================
// 1. LEER Y VALIDAR EL BODY
// =========================================
$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data) {
    echo json_encode(['success' => false, 'error' => 'Datos inválidos']);
    exit;
}

// Sanitizar y recoger
$nombre   = htmlspecialchars(trim($data['nombre']   ?? ''), ENT_QUOTES, 'UTF-8');
$ciudad   = htmlspecialchars(trim($data['ciudad']   ?? ''), ENT_QUOTES, 'UTF-8');
$telefono = htmlspecialchars(trim($data['telefono'] ?? ''), ENT_QUOTES, 'UTF-8');
$correo   = filter_var(trim($data['correo'] ?? ''), FILTER_VALIDATE_EMAIL);
$mensaje  = htmlspecialchars(trim($data['mensaje']  ?? ''), ENT_QUOTES, 'UTF-8');

// Validación de servidor (por si alguien salta el JS)
if (!$nombre || !$ciudad || !$telefono || !$correo || !$mensaje) {
    echo json_encode(['success' => false, 'error' => 'Todos los campos son obligatorios']);
    exit;
}

// =========================================
// 2. CONFIGURACIÓN SMTP
// ⚠️ REEMPLAZA estos valores por los de tu hosting
// =========================================
$smtp_host   = 'smtp.tudominio.com';         // ej. smtp.flagship.com
$smtp_user   = 'contacto@tudominio.com';     // ej. contacto@flagship.com
$smtp_pass   = 'TU_CONTRASEÑA_SMTP';         // la del correo
$smtp_port   = 465;                          // 465 (SSL) o 587 (TLS)
$smtp_secure = PHPMailer::ENCRYPTION_SMTPS;  // ENCRYPTION_SMTPS (465) o ENCRYPTION_STARTTLS (587)

// Correo destinatario (quien recibe el mensaje)
$destinatario_email = 'contacto@tudominio.com';
$destinatario_nombre = 'Flagship';

// =========================================
// 3. ENVÍO CON PHPMAILER
// =========================================
$mail = new PHPMailer(true);

try {
    // --- Servidor SMTP ---
    $mail->isSMTP();
    $mail->Host       = $smtp_host;
    $mail->SMTPAuth   = true;
    $mail->Username   = $smtp_user;
    $mail->Password   = $smtp_pass;
    $mail->SMTPSecure = $smtp_secure;
    $mail->Port       = $smtp_port;
    $mail->CharSet    = 'UTF-8';

    // --- Remitente / destinatario ---
    $mail->setFrom($smtp_user, 'Flagship Web');
    $mail->addAddress($destinatario_email, $destinatario_nombre);
    $mail->addReplyTo($correo, $nombre);   // para que respondas directo al cliente

    // --- Contenido ---
    $mail->isHTML(true);
    $mail->Subject = 'Nueva solicitud de cotización — Flagship';

    // Cuerpo HTML
    $mail->Body = "
        <h2 style='color:#2b1b66;'>Nueva solicitud de cotización</h2>
        <p><strong>Nombre:</strong> {$nombre}</p>
        <p><strong>Ciudad:</strong> {$ciudad}</p>
        <p><strong>Teléfono:</strong> {$telefono}</p>
        <p><strong>Correo:</strong> {$correo}</p>
        <p><strong>Mensaje:</strong></p>
        <p>" . nl2br($mensaje) . "</p>
    ";

    // Cuerpo plano (fallback si el cliente no lee HTML)
    $mail->AltBody = "Nombre: $nombre\nCiudad: $ciudad\nTeléfono: $telefono\nCorreo: $correo\nMensaje: $mensaje";

    $mail->send();

    echo json_encode(['success' => true]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error'   => 'Error al enviar el mensaje. Inténtalo de nuevo.'
    ]);
    // Log interno (no se envía al cliente)
    error_log('PHPMailer error: ' . $mail->ErrorInfo);
}