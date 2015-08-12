<?php

$data = file_get_contents("php://input");

$decoded = json_decode($data);

sendMail($decoded->email, $decoded->nombre, $decoded->mensaje, $decoded->asunto, $decoded->sucursal, $decoded->direccion);

function sendMail($email, $nombre, $mensaje, $asunto, $sucursal, $direccion)
{
    // message lines should not exceed 70 characters (PHP rule), so wrap it
    $productos = json_decode($mensaje);
    $detalles = '';

    foreach ($productos->detalles as $item) {
        $tmp = array_values($item->precios);
        $precio = $tmp[0]->precio;
        $number = $item->cantidad * $precio;
        $total = number_format((float)$number, 2, '.', '');
        $detalles = $detalles . '<tr><td style="text-align:left">' . $item->nombre . '</td><td style="text-align:right">' . $precio . '</td><td style="text-align:right">' . $item->cantidad . '</td><td style="text-align:right">' . $total . '</td></tr>';
    }

    $message = '<html><body><div style="font-family:Arial,sans-serif;font-size:15px;color:#006837; color:rgb(0,104,55);margin:0 auto; width:635px;">';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); border-style:Solid; border-color:#000000; border-color:rgba(0, 0, 0, 1); border-width:1px; left:-14px; top:-7px; width:635px; ">';
    $message .= '<div style="background-image: background-repeat:no-repeat; width:606px; height:176px;"><img src="http://192.185.67.199/~arielces/animations/img/logo.png"></div>';
    $message .= '<div style="color:#000;background:#FFFFFF; background:rgba(255,255,255,1); border-style:Solid; border-color:#000000; border-color:rgba(0,0,0,1); border-width:1px; margin: 40px 10px 30px 10px; border-radius:12px; -moz-border-radius: 12px; -webkit-border-radius: 12px;padding-bottom: 35px;">';
    $message .= '<div style="font-weight:bold;text-align:center;font-size:1.5em; margin-top:10px;"> Cliente '. $nombre .'</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Numero de Pedido: </label>' . $productos->carrito_id . '</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Fecha del Pedido: </label>' . $productos->fecha . '</div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold">Contenido del Pedido:</label></div>';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); margin:0 auto; padding:10px; border-radius:12px; -moz-border-radius:12px; -webkit-border-radius:12px; min-height: 200px; margin-top:5%;color:#fff;margin-left: 5px;margin-right: 5px;">';
    $message .= '<table style="font-size:12px;color:#fff;width:100%"><tr><th style="font-size:14px;text-align:left">Producto</th><th style="font-size:14px;text-align:right">Precio</th><th style="font-size:14px;text-align:right">Cantidad</th><th style="font-size:14px;text-align:right">Total</th></tr>';
    $message .= ''. $detalles .'';
    $message .= '</table></div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold; font-size:22px;">Subtotal: $</label><span style="font-size:20px; color:#006837;">' . number_format((float)$productos->total, 2, '.', '') . '</span></div>';
    $message .= '<div style="margin:20px 0 0 15px;"><label style="font-weight:bold; font-size:22px;">Total: $</label><span style="font-size:20px; color:#006837;">' . number_format((float)$productos->total, 2, '.', '') . '</span></div>';
    $message .= '<div style="background:#006837; background:rgba(0,104,55,1); padding:10px; border-radius:12px; -moz-border-radius:12px; -webkit-border-radius:12px; margin-top:5%;color:#fff;margin-left: 5px;margin-right: 5px;">';
    $message .= '<div style="font-size:18px; font-weight:bold; margin:10px 0 0 10px;">Direccion de Envio:</div>';
    $message .= '<div style="font-size:16px; margin-left:10px;">'. $nombre .'</div>';
    $message .= '<div style="font-size:16px; margin-left:10px;">'. $direccion .'</div>';
    $message .= '<div style="font-size:16px; margin:0 0 10px 10px;">'. $sucursal .'</div>';
    $message .= '</div></div></div>';
    $message .= '</table>';
    $message .= '</div></body></html>';

    $to = 'arielcessario@gmail.com';

    $subject = 'Detalle de Compra Nro ' . $productos->carrito_id . ' - Cliente ' . $nombre;
    $headers =  'From: ' .$email . "\r\n".
                'Reply-To: arielcessario@gmail.com' . "\r\n";

    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";

    mail($to, $subject, $message, $headers);

}


