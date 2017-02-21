angular.module('takealot.app.services', [])

.service('UserService', function() {
    this.saveUser = function(user) {
        window.localStorage.selpal_user = JSON.stringify(user);
    };

    this.getLoggedUser = function() {
        return (window.localStorage.takealot_user) ? JSON.parse(window.localStorage.takelot_user) : null;
    };
})

.service('ProductService', function($http, $scope, $q, productUrl) {
    this.getProducts = function() {
        var dfd = $q.defer;
        $http.get(productUrl).success(function(response) {
            dfd.resolve(response.products);
        })
        return dfd.promise;
    }

})

.service('LoggedUser', function($http, $scope, $mdModal, customerUrl) {
    function connFail() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Connection')
            .textContent('We seem to have a connection problem, try again in a few minutes.')
            .ariaLabel('takealot.com')
            .ok('OK')
        );
    };

    var users;

    function getLoggedUser() {
        $http.get(customerURL).then(function(response) {
                if (response)
                    users = response.data;
                else
                    connFail();
            }),
            function(error) {
                return error;
            }
        return users;
    }
})