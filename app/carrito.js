(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;
    //console.log(currentScriptPath);

    angular.module('acCarrito', ['ngRoute', 'ngCookies'])
        .directive('acAngularCarrito', AcAngularCarrito)
        .factory('acAngularCarritoService', AcAngularCarritoService)
        .factory('acAngularProductosService', AcAngularProductosService)
        .factory('acAngularSucursalesService', AcAngularSucursalesService)
        .factory('acAngularCarritoServiceAcciones', AcAngularCarritoServiceAcciones)
        .service('acAngularCarritoTotalService', AcAngularCarritoTotalService)
    ;


    AcAngularCarrito.$inject = ['$location', '$route', '$cookieStore', 'acAngularCarritoService', 'acAngularCarritoServiceAcciones', 'acAngularCarritoTotalService',
        'acAngularProductosService'];
    function AcAngularCarrito($location, $route, $cookieStore, acAngularCarritoService, acAngularCarritoServiceAcciones, acAngularCarritoTotalService,
                              acAngularProductosService) {
        return {
            restrict: 'E',
            scope: {
                snipet: '='
            },
            templateUrl: currentScriptPath.replace('.js', '.html'),
            controller: function ($scope, $compile, $http, $cookieStore) {

                var vm = this;
                vm.productosMockUp = [];
                vm.productosCarrito = acAngularCarritoTotalService.productosCarrito;
                vm.carrito = acAngularCarritoTotalService.carrito;

                vm.addProducto = addProducto;
                vm.removerProducto = removerProducto;
                vm.calcularTotal = calcularTotal;
                vm.comprar = comprar;

                ceckCarritoCookie();

                //acAngularProductosService.getProductos(
                //    function (data) {
                //        vm.productosMockUp = data;
                //    }
                //);


                //acAngularProductosService.getKits(function(data){console.log(data);});
                //acAngularProductosService.getKitById(1, function(data){console.log(data);});
                //acAngularProductosService.getOfertas(function(data){console.log(data);});
                //acAngularProductosService.getOfertasById(1, function(data){console.log(data);});
                //acAngularProductosService.getProductosDestacados(function(data){console.log(data);});
                //acAngularProductosService.getProductosMasVendidos(function(data){console.log(data);});
                //acAngularProductosService.getProductoById(123, function(data){console.log(data.nombre);});
                //acAngularProductosService.getProductosByCategoria(11, function(data){console.log(data);});


                function comprar() {
                    acAngularCarritoServiceAcciones.comprar(function(data){console.log(data);});
                }

                function addProducto(producto) {

                    acAngularCarritoServiceAcciones.addProducto(producto);

                }

                function removerProducto(index) {
                    acAngularCarritoServiceAcciones.removerProducto(index);

                }

                function ceckCarritoCookie() {

                    var loggedCookie = $cookieStore.get('app.userlogged');

                    //chequear si el usuario está loggeado, sino pedirle loggin
                    if (loggedCookie === undefined || loggedCookie.cliente === undefined) {
                        return false;
                    }


                    var carritoCookie = $cookieStore.get('carritoCookie');
                    if (carritoCookie === undefined ||
                        carritoCookie.carrito_id === undefined) {
                        acAngularCarritoService.nuevoCarrito(loggedCookie.userid,
                            function (data) {
                                vm.carrito.carrito_id = data.results;
                                vm.carrito.status = 1;
                                vm.carrito.total = 0.0;
                                vm.carrito.fecha = '';
                                $cookieStore.put('carritoCookie', vm.carrito);
                            }
                        );
                    } else {
                        acAngularCarritoService.getCarrito(carritoCookie.carrito_id,
                            function (data) {


                                vm.carrito.carrito_id = data[0].carrito_id;
                                vm.carrito.status = data[0].status;
                                vm.carrito.total = (vm.carrito.total !== 0.0 && vm.productosCarrito.length > 0) ? vm.carrito.total : parseFloat(data[0].total);
                                //vm.detalles = data[0].detalles;
                                vm.carrito.fecha = '';
                                $cookieStore.put('carritoCookie', vm.carrito);
                            });
                        //$cookies.put();
                    }

                }

                function calcularTotal() {
                    acAngularCarritoServiceAcciones.calcularTotal();
                }

                //vm.remover = function(){
                //    $cookieStore.remove('carritoCookie');
                //    console.log('entra');
                //}

            },

            controllerAs: 'carritoCtrl'
        };
    }

    function AcAngularCarritoTotalService() {
        this.carrito = {};
        this.productosCarrito = [];
    }

    AcAngularCarritoServiceAcciones.$inject = ['$cookieStore', 'acAngularCarritoTotalService', 'acAngularCarritoService'];
    function AcAngularCarritoServiceAcciones($cookieStore, acAngularCarritoTotalService, acAngularCarritoService) {
        var vm = this;
        vm.productosMockUp = [];
        vm.productosCarrito = acAngularCarritoTotalService.productosCarrito;
        vm.carrito = acAngularCarritoTotalService.carrito;

        var service = {};
        service.addProducto = addProducto;
        service.calcularTotal = calcularTotal;
        service.removerProducto = removerProducto;
        service.comprar = comprar;

        return service;

        function comprar(sucursal, callback) {

            var loggedCookie = $cookieStore.get('app.userlogged');

            //chequear si el usuario está loggeado, sino pedirle loggin
            if (loggedCookie === undefined || loggedCookie.cliente === undefined) {
                return false;
            }


            var carritoCookie = $cookieStore.get('carritoCookie');
            if (carritoCookie === undefined ||
                carritoCookie.carrito_id === undefined) {
                acAngularCarritoService.nuevoCarrito(loggedCookie.cliente[0].cliente_id,
                    function (data) {
                        vm.carrito.carrito_id = data.results;
                        vm.carrito.status = 1;
                        vm.carrito.total = 0.0;
                        vm.carrito.fecha = '';
                        $cookieStore.put('carritoCookie', vm.carrito);

                        acAngularCarritoTotalService.carrito.detalles = acAngularCarritoTotalService.productosCarrito;


                        acAngularCarritoService.confirmarCarrito(acAngularCarritoTotalService.carrito,
                            function (data) {
                                //console.log(data);

                                acAngularCarritoService.enviarDetalleCarrito(loggedCookie.cliente[0],
                                    acAngularCarritoTotalService.carrito, function(data){console.log(data);})

                                //console.log(acAngularCarritoTotalService.carrito);
                                $cookieStore.remove('carritoCookie');
                                acAngularCarritoTotalService.carrito = {};
                                acAngularCarritoTotalService.productosCarrito = [];
                                callback(data);
                            });

                    }
                );
            } else {
                acAngularCarritoService.getCarrito(carritoCookie.carrito_id,
                    function (data) {
                        vm.carrito.carrito_id = data[0].carrito_id;
                        vm.carrito.status = data[0].status;
                        vm.carrito.total = parseFloat(data[0].total);
                        //vm.detalles = data[0].detalles;
                        vm.carrito.fecha = '';
                        $cookieStore.put('carritoCookie', vm.carrito);


                        acAngularCarritoTotalService.carrito.detalles = acAngularCarritoTotalService.productosCarrito;


                        acAngularCarritoService.confirmarCarrito(acAngularCarritoTotalService.carrito,
                            function (data) {
                                //console.log(data);


                                acAngularCarritoService.enviarDetalleCarrito(loggedCookie.cliente[0],
                                    acAngularCarritoTotalService.carrito, function(data){console.log(data);})

                                //console.log(acAngularCarritoTotalService.carrito);
                                $cookieStore.remove('carritoCookie');
                                acAngularCarritoTotalService.carrito = {};
                                acAngularCarritoTotalService.productosCarrito = [];
                                callback(data);
                            });

                    });
                //$cookies.put();
            }


        }

        function addProducto(producto) {
            var producto_cantidad = producto;
            var encontrado = false;
            for (var i = 0; i < acAngularCarritoTotalService.productosCarrito.length; i++) {
                if (acAngularCarritoTotalService.productosCarrito[i].producto_id == producto.producto_id) {
                    encontrado = true;
                    acAngularCarritoTotalService.productosCarrito[i].cantidad = acAngularCarritoTotalService.productosCarrito[i].cantidad + 1;
                }
            }
            if (!encontrado) {
                producto_cantidad.cantidad = 1;
                acAngularCarritoTotalService.productosCarrito.push(producto_cantidad);
            }
            calcularTotal();

        }

        function calcularTotal() {
            acAngularCarritoTotalService.carrito.total = 0.0;
            for (var i = 0; i < acAngularCarritoTotalService.productosCarrito.length; i++) {
                acAngularCarritoTotalService.carrito.total = parseFloat(acAngularCarritoTotalService.carrito.total) +
                (parseFloat(acAngularCarritoTotalService.productosCarrito[i].precios[0].precio) * acAngularCarritoTotalService.productosCarrito[i].cantidad);
            }


        }

        function removerProducto(index) {
            acAngularCarritoTotalService.productosCarrito.splice(index, 1);
            calcularTotal();

        }
    }

    AcAngularCarritoService.$inject = ['$http'];
    function AcAngularCarritoService($http) {

        var url = currentScriptPath.replace('.js', '.php');
        var url_enviar = currentScriptPath.replace('carrito.js', 'contact.php');
        var service = {};
        //service.addProducto = addProducto;
        service.removeProducto = removeProducto;
        service.confirmarCarrito = confirmarCarrito;
        service.nuevoCarrito = nuevoCarrito;
        service.cancelarCarrito = cancelarCarrito;
        service.getCarrito = getCarrito;
        service.updateStock = updateStock;
        service.enviarDetalleCarrito = enviarDetalleCarrito;

        return service;


        //function addProducto(carrito, producto, callback) {
        //    return $http.post(url,
        //        {
        //            function: 'addProducto',
        //            carrito: carrito, producto: JSON.stringify(producto)
        //        })
        //        .success(function (data) {
        //            callback(data);
        //        })
        //        .error(function (data) {
        //        });
        //}

        function removeProducto(carrito, producto, callback) {
            return $http.post(url, {
                function: 'removeProducto',
                carrito: carrito, producto: JSON.stringify(producto)
            })
                .success(function (data) {
                    callback(data);
                })
                .success(function (data) {
                })
                .error(function (data) {
                });
        }

        function confirmarCarrito(carrito, callback) {
            return $http.post(url, {
                function: 'confirmarCarrito',
                carrito: JSON.stringify(carrito)
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function enviarDetalleCarrito(cliente, carrito, callback){
            return $http.post(url_enviar,
                {'email': cliente.mail, 'nombre': cliente.nombre + ' ' + cliente.apellido, 'mensaje': JSON.stringify(carrito), 'asunto': 'Nueva Compra por la página'})
                .success(
                function (data) {
                    callback(data);
                    //console.log(data);
                    //vm.enviado = true;
                    //$timeout(hideMessage, 3000);
                    //function hideMessage(){
                    //    vm.enviado = false;
                    //}
                    //
                    //vm.email = '';
                    //vm.nombre = '';
                    //vm.mensaje = '';
                    //vm.asunto = '';
                })
                .error(function (data) {
                    console.log(data);
                });
        }

        function nuevoCarrito(userid, callback) {
            return $http.post(url, {function: 'nuevoCarrito', userid: userid})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function cancelarCarrito(carrito, callback) {
            return $http.post(url, {
                function: 'cancelarCarrito',
                carrito: carrito
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function getCarrito(carrito, callback) {
            return $http.post(url, {
                function: 'getCarrito',
                carrito: carrito
            })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function updateStock() {
            return $http.post(url, {function: 'updateStock', data: data}, {cache: true})
                .success(function (data) {
                })
                .error(function (data) {
                });
        }
    }


    AcAngularProductosService.$inject = ['$http'];
    function AcAngularProductosService($http) {
        var url = currentScriptPath.replace('carrito.js', 'productos.php');
        var service = {};
        service.getProductos = getProductos;
        service.getProductosDestacados = getProductosDestacados;
        service.getProductosMasVendidos = getProductosMasVendidos;
        service.getProductoById = getProductoById;
        service.getProductoByName = getProductoByName;
        service.getProductosByCategoria = getProductosByCategoria;
        service.getOfertas = getOfertas;
        service.getOfertasById = getOfertasById;
        service.getKits = getKits;
        service.getKitById = getKitById;



        return service;

        function getProductos(callback) {
            return $http.get(url + '?function=getProductos', {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });


            //return $http.post(url, {function: 'getProductos'}, {cache: true})
            //    .success(function (data) {
            //        callback(data);
            //    })
            //    .error(function (data) {
            //    });
        }

        function getProductoByName(name, callback) {
            getProductos(function (data) {
                //console.log(data);
                var response = data.filter(function (elem) {
                    var elemUpper = elem.nombre.toUpperCase();

                    var n = elemUpper.indexOf(name.toUpperCase());

                    if (n === undefined || n === -1) {
                        n = elem.descripcion.indexOf(name);
                    }

                    if (n !== undefined && n > -1) {
                        return elem;
                    }
                });
                callback(response);
            })

        }

        function getProductoById(id, callback) {
            getProductos(function (data) {
                var response = data.filter(function (elem, index, array) {
                    return elem.producto_id == id;
                    //if(elem.destacado == 1){
                    //    return elem;
                    //}
                })[0];

                callback(response);
            });
        }

        function getProductosByCategoria(id, callback) {
            getProductos(function (data) {
                var response = data.filter(function (elem, index, array) {

                    return elem.categoria_id == id;
                    //if(elem.destacado == 1){
                    //    return elem;
                    //}
                });

                callback(response);
            });
        }

        function getProductosDestacados(callback) {
            getProductos(function (data) {
                var response = data.filter(function (elem, index, array) {
                    if (elem.destacado == 1) {
                        return elem;
                    }
                });

                callback(response.slice(0, 8));
            });


        }

        function getProductosMasVendidos(callback) {
            getProductos(function (data) {
                var response = data.sort(function (a, b) {
                    return b.vendidos - a.vendidos;
                    //if (a.name > b.name) {
                    //    return 1;
                    //}
                    //if (a.name < b.name) {
                    //    return -1;
                    //}
                    //// a must be equal to b
                    //return 0;
                });

                callback(response.slice(0, 8));
            });
        }

        function getOfertas(callback) {
            return $http.post(url, {function: 'getOfertas'}, {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function getOfertasById(id, callback) {
            getOfertas(function (data) {
                var response = data.filter(function (elem, index, array) {

                    return elem.oferta_id == id;
                    //if(elem.destacado == 1){
                    //    return elem;
                    //}
                })[0];

                callback(response);
            });
        }

        function getKits(callback) {
            return $http.post(url, {function: 'getKits'}, {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function getKitById(id, callback) {
            getKits(function (data) {
                var response = data.filter(function (elem, index, array) {

                    return elem.kit_id == id;
                    //if(elem.destacado == 1){
                    //    return elem;
                    //}
                })[0];

                callback(response);
            });
        }


    }


    AcAngularSucursalesService.$inject = ['$http'];
    function AcAngularSucursalesService($http){
        var url = currentScriptPath.replace('carrito.js', 'carrito.php');
        var service = {};
        service.getSucursales = getSucursales;

        return service;

        function getSucursales(callback) {
            return $http.get(url + '?function=getSucursales', {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });

        }
    }
})();