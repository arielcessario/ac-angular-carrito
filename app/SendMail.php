<?php
/**
 * Created by PhpStorm.
 * User: emaneff
 * Date: 28/04/2015
 * Time: 01:33 PM
 * Send a email with a new password
 */

$data = file_get_contents("php://input");

$decoded = json_decode($data);

sendMail($decoded->mensaje, $decoded->carrito_id);

function sendMail($mensaje, $carrito_id){

    $success = mail('mmaneff@gmail.com', "Cancelar Pedido " + $carrito_id, $mensaje, "Cancelar Pedido");

    echo json_encode( $success );
}