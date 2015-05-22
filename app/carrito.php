<?php
/**
 * Created by PhpStorm.
 * User: kn
 * Date: 16/03/15
 * Time: 19:13
 */

session_start();
require_once 'MyDBi.php';

$data = file_get_contents("php://input");

$decoded = json_decode($data);

if ($decoded->function == 'getProductos') {
    getProductos();
} elseif ($decoded->function == 'updateStock') {
    updateStock($decoded->productos);
} elseif ($decoded->function == 'addProducto') {
    addProducto($decoded->carrito, $decoded->producto);
} elseif ($decoded->function == 'removeProducto') {
    removeProducto($decoded->carrito, $decoded->producto);
}elseif ($decoded->function == 'confirmarCarrito') {
    confirmarCarrito($decoded->carrito);
}elseif ($decoded->function == 'nuevoCarrito') {
    nuevoCarrito($decoded->userid);
}elseif ($decoded->function == 'cancelarCarrito') {
    cancelarCarrito($decoded->carrito);
}elseif ($decoded->function == 'getCarrito') {
    getCarrito($decoded->carrito);
}


function getProductos()
{
    $db = new MysqliDb();
    $precios_arr = array();
    $proveedores_arr = array();
    $final = array();
//    $results = $db->get('productos');

    $results = $db->rawQuery(
        "SELECT producto_id,
            nombre,
            descripcion,
            pto_repo,
            cuenta_id,
            sku,
            status,
            vendidos,
            destacado,
            0 fotos,
            0 precios,
            0 proveedores
        FROM Bayres.productos;");

    foreach ($results as $row) {

        $db->where("producto_id", $row["producto_id"]);
        $fotos = $db->get('fotos_prod');
        $row["fotos"] = $fotos;
        array_push($precios_arr, $row);
    }

    foreach ($precios_arr as $row) {

        $db->where("producto_id", $row["producto_id"]);
        $db->where("precio_tipo_id", '0');
        $precios = $db->get('precios');
        $row["precios"] = $precios;
        array_push($proveedores_arr, $row);
    }

    foreach ($proveedores_arr as $row) {

        $db->where("producto_id", $row["producto_id"]);
        $proveedores = $db->get('prov_prod');
        $row["proveedores"] = $proveedores;
        array_push($final, $row);
    }

    echo json_encode($final);
}
function addProducto($carrito, $producto){
    $db = new MysqliDb();
//    $decoded = json_decode($producto);
    $decoded = $producto;
    $data =[
        'carrito_id' => $carrito,
        'producto_id' => $decoded->producto_id,
        'cantidad' => $decoded->cantidad,
        'precio' => $decoded->precios[0]->precio
    ];

    $results = $db->insert('carrito_detalles', $data);
//    $res = array('status' => 1, 'results' => []);
    if($results>-1){
//        $res['results'] = $results;
//        echo json_encode($res);

    } else {
//        $res->status = 0;
//        echo $res;
    }

}
function removeProducto($carrito, $producto){
    $db = new MysqliDb();
    $db->where('producto_id', $producto);
    $db->where('carrito_id', $carrito);

    $results = $db->delete('carrito_detalles');
    $res = array('status' => 1, 'results' => []);
    if($results){
        $res->results = 1;
        echo $res;

    } else {
        $res->status = 0;
        echo $res;
    }
}
function confirmarCarrito($carrito){
    $db = new MysqliDb();
    $decoded = json_decode($carrito);
    $data =[
        'status' => 2,
        'total' => $decoded->total
    ];

    $db->where('carrito_id', $decoded->carrito_id);
    $results = $db->update('carritos', $data);
    $res =['status' => 1, 'results' => 1];

    if($results){
        foreach ($decoded->detalles as  $producto){
            addProducto($decoded->carrito_id, $producto);
        }
        $res['results'] = 1;
        echo json_encode($res);
//        echo '10';

    } else {
        $res->status = 0;
        echo $res;
    }
}
function nuevoCarrito($userid){
    $db = new MysqliDb();
    $data = array('cliente_id'=> $userid, 'status' => 1, 'total' => 0.0);

//    $results = $db->rawQuery('insert into carritos(status,total) values(1,0.0)');
    $results = $db->insert('carritos', $data);
    $res = array('status'=>1, 'results'=>-1);
    if($results>-1){
        $res['results'] = $results;
        echo json_encode($res);

    } else {
        $res->status = 0;
        echo $res;
    }
}
function cancelarCarrito($carrito){
    $db = new MysqliDb();
    $data =[
        'status' => 0,
        'total' => $carrito->total
    ];

    $db->where('carrito_id', $carrito->carrito_id);
    $results = $db->update('carritos', $data);
    $res = array('status' => 1, 'results' => []);
    if($results){
        $res->results = 1;
        echo $res;

    } else {
        $res->status = 0;
        echo $res;
    }
}
function getCarrito($carrito){
    $db = new MysqliDb();
    $final = array();

    $results = $db->rawQuery(
        "SELECT carrito_id,
            status,
            total,
            0 detalles
        FROM carritos
        WHERE carrito_id = ".$carrito.";");

    foreach ($results as $row) {

        $db->where("carrito_id", $row["carrito_id"]);
        $detalles = $db->get('carrito_detalles');
        $row["detalles"] = $detalles;
        array_push($final, $row);
    }
    echo json_encode($final);
}



//Stock +
function updateStock($productos){
    $db = new MysqliDb();
//    $results = -1;
//    foreach ($productos as $producto) {
//        $data = array(
//            'producto_id' => $detalle->producto_id,
//            'proveedor_id' => $pedido->proveedor_id,
//            'sucursal_id' => $pedido->sucursal_id,
//            'cant_actual' => $detalle->cantidad,
//            'cant_total' => $detalle->cantidad,
//            'costo_uni' => $detalle->precio_unidad
//        );
//
//
//        $results = $db->update('stock', $data);
//
//    }
//    $res = [];
//
//    if ($results > -1) {
//        $res = ['status' => 1, 'results' => $results];
//        echo $res;
//
//    } else {
//        $res->status = 0;
//        echo $res;
//    }
}
//Stock -