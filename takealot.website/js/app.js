/* global angular */
angular.module('takealot', [
    'takealot.app.controllers',
    'takealot.app.services',
    'ui.router',
    'ui.bootstrap'
])

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {

    $stateProvider

        .state('home', {
        url: "/home.",
        templateUrl: "../views/home.html"
    })

    .state('register', {
        url: "/registeration",
        templateUrl: "../views/register.html"
    })

    .state('products', {
        url: '/products',
        templateUrl: '../views/product.html'
    })

    .state('login', {
        url: '/login',
        templateUrl: '../views/login.html'
    })

    .state('single', {
        url: '/item_view',
        templateUrl: '../views/single.html'
    })

    .state('single_cart', {
        url: '/single_cart',
        templateUrl: '../views/single_cart.html'
    })

    .state('loginMsg', {
        url: '/successful',
        templateUrl: '../patials/loginSuccess.html'
    })

    .state('RegMsg', {
        url: '/successful',
        templateUrl: '../patials/registerSuccess.html'
    })

    .state('subMsg', {
        url: '/successful',
        templateUrl: '../patials/substribeSuccess.html'
    })

    .state('cart', {
        url: "/cart",
        templateUrl: "../views/cart.html"
    })

    .state('checkout', {
        url: "/checkout",
        templateUrl: "../views/checkout.html"
    })

    $urlRouterProvider.otherwise('/');

    $httpProvider.interceptors.push(function($q) {
        return {
            responseError: function(rejection) {
                if (rejection.status <= 0) {
                    //window.location = '../patials/enquireSuccess.html';
                    return;
                }
                return $q.reject(rejection);
            }
        };
    });
});