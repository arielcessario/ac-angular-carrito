<?php

$data = file_get_contents("php://input");

$decoded = json_decode($data);

sendMail($decoded->email, $decoded->nombre, $decoded->mensaje, $decoded->asunto, $decoded->sucursal);

function sendMail($email, $nombre, $mensaje, $asunto, $sucursal)
{
    // message lines should not exceed 70 characters (PHP rule), so wrap it
    $productos = json_decode($mensaje);
    $detalles = '';

    foreach ($productos->detalles as $item) {
        $detalles = '<tr><td>' . $item->nombre . '</td><td>' . $item->cantidad . '</td></tr>';
    }


    $final = '<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
    <style>
        body{
            font-family: Arial, sans-serif;
        }
    </style>

</head>
<body>

<h1>Nuevo Pedido desde la página</h1>

<h2>Usuario: ' . $nombre . '</h2>
<h2>Mail: ' . $email . '</h2>
<h2>Retira por: ' . $sucursal . ' </h2>


<h2>Detalle de pedido</h2>
<table>
    <tr>
        <th>Producto</th>
        <th>Cantidad</th>
    </tr>
    ' .
        $detalles
        . '
</table>

<h2>Total $' . $productos->total . '</h2>

</body>
</html>';

    $to = 'arielcessario@gmail.com';

    $subject = 'Venta online';

    $headers = "From: " . strip_tags($email) . "\r\n";
    $headers .= "Reply-To: " . strip_tags($email) . "\r\n";
//    $headers .= "CC: susan@example.com\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";


    mail($to, $subject, $final, $headers);

//    $mensaje = wordwrap("Mensaje de " . $nombre . "\n Cuerpo del mensaje: " . $final, 100);
    // send mail
//    mail("arielcessario@gmail.com", $asunto, $mensaje, "From: $email\n");
//    echo ($email . $nombre . $mensaje . $asunto);

    print_r($productos);
}


