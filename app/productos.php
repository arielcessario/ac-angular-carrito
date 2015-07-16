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


if($decoded != null) {
    if ($decoded->function == 'getProductos') {
        getProductos();
    } else if ($decoded->function == 'getOfertas') {
        getOfertas();
    } else if ($decoded->function == 'getKits') {
        getKits();
    }
}else{
    $function = $_GET["function"];
    if ($function == 'getProductos') {
        getProductos();
    }elseif ($function == 'getCategorias') {
        getCategorias();
    }
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
            categoria_id,
            (SELECT nombre FROM categorias c WHERE c.categoria_id = p.categoria_id) categoria,
            0 fotos,
            0 precios,
            0 proveedores
        FROM productos p;");

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

function getOfertas()
{
    $db = new MysqliDb();
    $results = $db->get('ofertas');
    echo json_encode($results);
}


function getCategorias()
{
    $db = new MysqliDb();
    $results = $db->rawQuery('select categoria_id, nombre, parent_id, 0 subcategorias from categorias');
    $categorias = array();

    foreach($results as $row){
        $db->where('parent_id', $row["parent_id"]);
        $result_categoria = $db->get('categorias');
        $row["subcategorias"] = $result_categoria;
        array_push($categorias, $row);
    }
    echo json_encode($categorias);
}



function getKits()
{
    $db = new MysqliDb();
    $kits = $db->rawQuery('select kit_id, nombre, 0 productos from kits;');
    $precios_arr = array();
    $proveedores_arr = array();
    $producto_arr = array();
    $final = array();


    foreach ($kits as $kit) {

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
            categoria_id,
            (SELECT nombre FROM categorias c WHERE c.categoria_id = p.categoria_id) categoria,
            0 fotos,
            0 precios,
            0 proveedores
        FROM productos p
        WHERE producto_id IN(SELECT producto_id FROM kits_prods WHERE kit_id = " . $kit["kit_id"] . ");");

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
            array_push($producto_arr, $row);
        }

        $kit["productos"] = $producto_arr;
        array_push($final, $kit);


    }


    echo json_encode($final);
}