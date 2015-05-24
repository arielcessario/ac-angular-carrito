<?php

$data = file_get_contents("php://input");

$decoded = json_decode($data);

sendMail($decoded->email, $decoded->nombre, $decoded->mensaje, $decoded->asunto);

function sendMail($email, $nombre, $mensaje, $asunto){
    // message lines should not exceed 70 characters (PHP rule), so wrap it
    $mensaje = wordwrap("Mensaje de ". $nombre . "\n Cuerpo del mensaje: " . $mensaje, 100);
    // send mail
    mail("arielcessario@gmail.com", $asunto, $mensaje, "From: $email\n");
    echo ($email . $nombre . $mensaje . $asunto);
}

