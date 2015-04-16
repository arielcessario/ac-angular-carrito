(function () {
    'use strict';

    var scripts = document.getElementsByTagName("script");
    var currentScriptPath = scripts[scripts.length - 1].src;
    //console.log(currentScriptPath);

    angular.module('acCarrito', ['ngRoute', 'ngCookies'])
        .directive('acAngularCarrito', AcAngularCarrito)
        .factory('acAngularCarritoService', AcAngularCarritoService)
        .factory('acAngularCarritoServiceAcciones', AcAngularCarritoServiceAcciones)
        .service('acAngularCarritoTotalService', AcAngularCarritoTotalService)
    ;


    AcAngularCarrito.$inject = ['$location', '$route', '$cookieStore', 'acAngularCarritoService', 'acAngularCarritoServiceAcciones', 'acAngularCarritoTotalService'];
    function AcAngularCarrito($location, $route, $cookieStore, acAngularCarritoService, acAngularCarritoServiceAcciones, acAngularCarritoTotalService) {
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
                vm.removerProducto= removerProducto;
                vm.calcularTotal= calcularTotal;
                vm.comprar= comprar;

                ceckCarritoCokie();

                acAngularCarritoService.getProductos(
                    function (data) {
                        vm.productosMockUp = data;
                    }
                );

                function comprar(){
                    acAngularCarritoServiceAcciones.comprar();
                }

                function addProducto(producto) {

                    acAngularCarritoServiceAcciones.addProducto(producto);

                }

                function removerProducto(index){
                    acAngularCarritoServiceAcciones.removerProducto(index);

                }

                function ceckCarritoCokie() {
                    var carritoCookie = $cookieStore.get('carritoCookie');
                    if (carritoCookie === undefined ||
                        carritoCookie.carrito_id === undefined) {
                        acAngularCarritoService.nuevoCarrito(
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
                                vm.carrito.total = parseFloat(data[0].total);
                                //vm.detalles = data[0].detalles;
                                vm.carrito.fecha = '';
                                $cookieStore.put('carritoCookie', vm.carrito);
                            });
                        //$cookies.put();
                    }

                }

                function calcularTotal(){
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



    function AcAngularCarritoTotalService(){
        this.carrito = {};
        this.productosCarrito = [];
    }


    AcAngularCarritoServiceAcciones.$inject = ['$cookieStore','acAngularCarritoTotalService', 'acAngularCarritoService'];
    function AcAngularCarritoServiceAcciones($cookieStore, acAngularCarritoTotalService, acAngularCarritoService){
        var service = {};
        service.addProducto = addProducto;
        service.calcularTotal = calcularTotal;
        service.removerProducto= removerProducto;
        service.comprar= comprar;

        return service;

        function comprar(){

            //chequear si el usuario está loggeado, sino pedirle loggin
            acAngularCarritoTotalService.carrito.detalles = acAngularCarritoTotalService.productosCarrito;


            acAngularCarritoService.confirmarCarrito(acAngularCarritoTotalService.carrito,
            function(data){
                //console.log(data);

                //console.log(acAngularCarritoTotalService.carrito);
                $cookieStore.remove('carritoCookie');
                acAngularCarritoTotalService.carrito = {};
                acAngularCarritoTotalService.productosCarrito = [];
            });



        }

        function addProducto(producto) {
            var producto_cantidad = producto;
            var encontrado = false;
            for(var i=0; i<acAngularCarritoTotalService.productosCarrito.length;i++){
                if ( acAngularCarritoTotalService.productosCarrito[i].producto_id == producto.producto_id) {
                    encontrado = true;
                    acAngularCarritoTotalService.productosCarrito[i].cantidad =acAngularCarritoTotalService.productosCarrito[i].cantidad +1;
                }
            }
            if(!encontrado){
                producto_cantidad.cantidad = 1;
                acAngularCarritoTotalService.productosCarrito.push(producto_cantidad);
            }
            calcularTotal();

        }

        function calcularTotal(){
            acAngularCarritoTotalService.carrito.total = 0.0;
            for(var i=0; i<acAngularCarritoTotalService.productosCarrito.length;i++){
                acAngularCarritoTotalService.carrito.total = parseFloat(acAngularCarritoTotalService.carrito.total) +
                (parseFloat(acAngularCarritoTotalService.productosCarrito[i].precios[0].precio) * acAngularCarritoTotalService.productosCarrito[i].cantidad);
            }


        }

        function removerProducto(index){
            acAngularCarritoTotalService.productosCarrito.splice(index,1);
            calcularTotal();

        }
    }

    AcAngularCarritoService.$inject = ['$http'];
    function AcAngularCarritoService($http) {
        var url = 'carrito.php';
        var service = {};
        service.getProductos = getProductos;
        service.addProducto = addProducto;
        service.removeProducto = removeProducto;
        service.confirmarCarrito = confirmarCarrito;
        service.nuevoCarrito = nuevoCarrito;
        service.cancelarCarrito = cancelarCarrito;
        service.getCarrito = getCarrito;
        service.updateStock = updateStock;

        return service;

        function getProductos(callback) {
            return $http.post(url, {function: 'getProductos'}, {cache: true})
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

        function addProducto(carrito, producto, callback) {
            return $http.post(url,
                {
                    function: 'addProducto',
                    carrito: carrito, producto: JSON.stringify(producto)
                })
                .success(function (data) {
                    callback(data);
                })
                .error(function (data) {
                });
        }

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

        function nuevoCarrito(callback) {
            return $http.post(url, {function: 'nuevoCarrito'})
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
})();