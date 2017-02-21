/* global find */
//const productURL = "http://localhost:8080/products";
const productURL = "../data/products.json";
const customerURL = "http://localhost:9000/customers";
const subscribeURL = "http://localhost:9000/subscriptions";
const enquireURL = "http://localhost:9000/enquiries";
//const wishlistURL = "http://localhost:9000/wishlists";
const orderedProductsURL = "http://localhost:9000/orderedproducts";
const checkoutURL = "http://localhost:9000/checkout";
const orderURL = "http://localhost:9000/orders";

angular.module('takealot.app.controllers', ['ui.bootstrap', 'ui.router', 'ngMaterial'])

.controller('RegistrationCtrl', function($http, $scope, $mdDialog) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    if (cart == null)
        $scope.cartItems = 0;
    else
        $scope.cartItems = cart.length;

    $http.get("../data/days.json").then(function(response) {
        $scope.days = response.data.day;
    });

    $http.get("../data/years.json").then(function(response) {
        $scope.years = response.data.year;
    });

    function success() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Subscription')
            .textContent('You have successfully registered to takealot.com, an email is sent to you, Thank You')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            window.location = "../../views/home.html";
        })
    };

    function errorFields() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Registration')
            .textContent('Make sure you have filled in all the required fields, try again.')
            .ariaLabel('takealot.com')
            .ok('OK')
        )
    };

    function errorEmail() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Registration')
            .textContent('User with that email already exist.')
            .ariaLabel('takealot.com')
            .ok('OK')
        )
    };

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

    $http.get(customerURL).then(function(response) {
        if (response) {
            var users = response.data;

            for (var id in users) {
                if (users[id].email != $scope.email) {
                    $scope.register = function() {
                        if (!!$scope.month) {
                            var mon = $scope.month;
                            $scope.mon = mon.substring(0, 3);
                        }

                        $scope.dob = $scope.day + "-" + $scope.mon + "-" + $scope.year;

                        if ($scope.promo == null)
                            $scope.promo = false;
                        if ($scope.sms == null)
                            $scope.sms = false;

                        if ($scope.promo == true)
                            $scope.promo = "YES";
                        else
                            $scope.promo = "NO";

                        if ($scope.sms == true)
                            $scope.sms = "YES";
                        else
                            $scope.sms = "NO";


                        $scope.sendData = {
                            firstName: $scope.name,
                            lastName: $scope.surname,
                            salutation: "",
                            customerId: "",
                            email: $scope.email,
                            cellNumber: $scope.cellNumber,
                            telephone: "",
                            telephone2: "",
                            gender: $scope.gender,
                            dob: $scope.dob,
                            pin: $scope.password,
                            sms: $scope.sms,
                            promo: $scope.promo
                        }
                        var saveUser = {
                            name: $scope.sendData.firstName,
                            surname: $scope.sendData.lastName,
                            email: $scope.sendData.email
                        }

                        var custId;
                        if ($scope.name === undefined || $scope.surname === undefined || $scope.email === undefined || $scope.cellNumber === undefined || $scope.gender === undefined || $scope.dob === undefined || $scope.password === undefined) {
                            errorFields();
                        } else {
                            $http.put(customerURL, $scope.sendData).then(function(response) {
                                    console.log(response)
                                    window.localStorage.takealot_user = JSON.stringify(saveUser);
                                    logUser();
                                    success();
                                }),
                                function(error) {
                                    $scope.noconnect = true;
                                    return error;
                                }
                        }
                    }
                } else {
                    errorEmail();
                }

                function logUser() {
                    $http.get('customerURL', function(response) {
                        if (response) {
                            console.log("Users after registration")
                            console.log(response.data)
                        }
                    })
                }
            }

        } else
            connFail();
    })


})

.controller('HomeCtrl', function($scope, $http, $stateParams) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    if (cart == null)
        $scope.cartItems = 0;
    else
        $scope.cartItems = cart.length;

    $scope.subscribe = function() {
        window.location = "../../views/subscribe.html";
    }

    function connFail() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Connection')
            .textContent('We seem to have a connection error, try again in a few minutes.')
            .ariaLabel('takealot.com')
            .ok('OK')
        );
    };

    $http.get(productURL).then(function(response) {
        if (response) {
            $scope.prod = response.data;
            var pro = $scope.prod;
            $scope.products = pro.slice(0, 3);
        } else
            connFail();

    })

    $scope.viewProduct = function(product) {
        if (product) {
            var itemId = {
                viewItemId: product.productId
            }
        }
        window.localStorage.item = JSON.stringify(itemId);
        window.location = "../../views/single.html";
    }

    var products = [];
    $scope.addToCart = function(product) {
        if (product) {
            var saveProduct = {
                productId: product.productId
            }
            if (cart == null || cart.length == 0) {
                products.push(saveProduct);
                window.localStorage.cart = JSON.stringify(products);
            } else {
                cart.push(saveProduct)
                window.localStorage.cart = JSON.stringify(cart);
            }
            $scope.cartItems += 1;
        }
    }
})

.controller('ProductsCtrl', function($scope, $http) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    if (cart == null)
        $scope.cartItems = 0;
    else
        $scope.cartItems = cart.length;

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

    $http.get(productURL).then(function(response) {
        if (response)
            $scope.products = response.data;
        else
            connFail();
    })

    $scope.viewProduct = function(product) {
        if (product) {
            var itemId = {
                viewItemId: product.productId
            }
        }
        window.localStorage.item = JSON.stringify(itemId);
        window.location = "../../views/single.html";
    }

    var products = [];
    $scope.addToCart = function(product) {
        if (product) {
            var saveProduct = {
                productId: product.productId
            }
            products.push(saveProduct);
            if (cart == null || cart.length == 0)
                window.localStorage.cart = JSON.stringify(products, null);
            else {
                cart.push(saveProduct)
                window.localStorage.cart = JSON.stringify(cart);
            }
            $scope.cartItems += 1;
        }
    }

})

.controller('LoginCtrl', function($scope, $http, $mdDialog) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    if (cart == null)
        $scope.cartItems = 0;
    else
        $scope.cartItems = cart.length;

    function success() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Login')
            .textContent('Login successful, happy shopping with takealot.com')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            window.location = "../../views/home.html";
        })
    };

    function fail() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Login')
            .textContent('Password/Email do not match, try again.')
            .ariaLabel('takealot.com')
            .ok('OK')
        )
    };

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
    $http.get(customerURL).then(function(response) {
            if (response)
                users = response.data;
            else
                connFail();
        }),
        function(error) {
            return error;
        }

    $scope.login = function() {
        console.log("click");
        for (var id in users) {
            if (users[id].email == $scope.loginEmail && users[id].pin == $scope.loginPass) {
                console.log('inside')
                var loginUser = {
                    name: users[id].firstName,
                    surname: users[id].lastName,
                }

                var userId = { loggedId: users[id].customerId }

                window.localStorage.takealot_user = JSON.stringify(loginUser);
                window.localStorage.takealot_userId = JSON.stringify(userId);
                success();
                break;
            } else {
                fail();
                break;

            }
        }
    }

})

.controller('CartCtrl', function($scope, $http, $mdDialog) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));
    var userId = JSON.parse(window.localStorage.getItem('takealot_userId'));

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    if (cart == null || cart == 0) {
        $scope.cartItems = 0;
        $scope.cartEmpty = true;
    } else
        $scope.cartItems = cart.length;

    var productIds = [];

    for (var id in cart) {
        productIds[id] = cart[id].productId;
    }

    function fail() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Login')
            .textContent('You can not checkout without login, login and then checkout')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            window.location = "../../views/login.html";
        })
    };

    var data = [];
    var cartTotal = 0;
    $http.get(productURL).then(function(response) {
        var products = response.data;
        for (var i in productIds) {
            for (var id in products) {
                if (productIds[i] == products[id].productId) {
                    var cartProd = {
                        category: products[id].category,
                        price: products[id].price,
                        title: products[id].title,
                        picture: products[id].picture,
                        description: products[id].description,
                        productId: products[id].productId
                            //'data:image/jpg;base64,' +
                    }

                } else {}

            }
            data.push(cartProd);
            $scope.cartProducts = data;
        }
        for (var id in data) {
            cartTotal += data[id].price;
        }
        $scope.cartTotal = cartTotal;
        if (cartTotal >= 1000) {
            $scope.delivery = true;
        } else {
            $scope.cartTotal += 60;
        }
    })

    $scope.viewItem = function(product) {
        if (product) {
            var itemId = {
                viewItemId: product.productId
            }
        }
        window.localStorage.item = JSON.stringify(itemId);
        window.location = "../../views/single_cart.html";
    }

    $scope.continue = function() {
        window.location = "../../views/product.html";
    }

    $scope.checkout = function() {
        if (userId == null || userId == 0) {
            fail();
        } else {
            window.location = "../../views/checkout.html";
        }
    }

})

.controller('SingleCtrl', function($scope, $http) {
    var item = JSON.parse(window.localStorage.getItem('item'));
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));

    $scope.cartItems = cart.length;

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    $http.get('../../data/products.json').then(function(response) {
        var products = response.data;
        var data = [];
        for (var id in products) {
            if (item.viewItemId == products[id].productId) {
                var view = {
                    title: products[id].title,
                    description: products[id].description,
                    price: products[id].price,
                    picture: products[id].picture,
                    productId: products[id].productId
                        // $scope.availability = products[id].availability;
                        // $scope.shipping = products[id].shipping;
                        // $scope.productDetails = products[id].productDetails;

                }
                console.log('Found')
                data.push(view);
            } else { console.log('Not Found') }

            $scope.itemView = data;
        }
    })

    $scope.removeItem = function(item) {
        if (item) {
            window.localStorage.removeItem('item');
            for (var i in cart) {
                if (item.productId == cart[i].productId) {
                    cart.splice(i, 1);
                }
            }
            window.localStorage.cart = JSON.stringify(cart);
            $scope.itemDeleted = true;
        }
    }

    $scope.addToCart = function(product) {
        if (product) {
            var saveProduct = {
                productId: product.productId
            }
            cart.push(saveProduct)
            window.localStorage.cart = JSON.stringify(cart);
            $scope.cartItems += 1;
            window.location = "../../views/product.html";
        }
    }

    $scope.close = function() {
        window.location = "../../views/cart.html";
    }
})

.controller('SubscribeCtrl', function($http, $scope, $mdDialog) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    if (cart == null || cart == 0)
        $scope.cartItems = 0;
    else
        $scope.cartItems = cart.length;

    $scope.subs = [{
        name: "Computers & Tablets"
    }, {
        name: "Cellphones"
    }, {
        name: "TV/Audio & Videos"
    }, {
        name: "Music"
    }, {
        name: "Movies & TV"
    }, {
        name: "Books"
    }, {
        name: "Gaming"
    }, {
        name: "Liquor"
    }]

    function success() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Subscription')
            .textContent('You have successfully subscribed, Thank You')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            window.location = "../../views/home.html";
        })
    };

    function fail() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Subscription')
            .textContent('Make sure you have filled in all the required fields, try again.')
            .ariaLabel('takealot.com')
            .ok('OK')
        );
    };

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

    //Selecting subscriptions
    $scope.subscribe = function() {
        $scope.subscribeNameArray = [];
        angular.forEach($scope.subs, function(sub) {
            if (sub.selected)
                $scope.subscribeNameArray.push(sub.name);
        });

        var subscribed = $scope.subscribeNameArray.toString();

        $scope.subscriber = {
            firstName: $scope.name,
            lastName: $scope.surname,
            email: $scope.email,
            subscriptions: subscribed
        }

        if ($scope.name == undefined || $scope.surname == undefined || $scope.email == undefined || subscribed == undefined) {
            fail();
        } else {
            $http.put(subscribeURL, $scope.subscriber).then(function(response) {
                    if (response)
                        success();
                    else
                        connFail();
                }),
                function(error) {
                    return error;
                }
        }
    }

})

.controller('EnquiriesCtrl', function($scope, $http, $mdDialog) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var cart = JSON.parse(window.localStorage.getItem('cart'));

    if (user == null)
        $scope.loggedUser = "";
    else
        $scope.loggedUser = user.name;

    if (cart == null || cart == 0)
        $scope.cartItems = 0;
    else
        $scope.cartItems = cart.length;

    function success() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Enquiry')
            .textContent('Your enquiry is sent successfully, we will get back to you within 24 hours, Thank You')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            window.location = "../../views/home.html";
        })
    };

    function fail() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Enquiry')
            .textContent('Make sure you have filled in all the required fields, try again.')
            .ariaLabel('takealot.com')
            .ok('OK')
        );
    };

    function connFail() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Connection')
            .textContent('Something went wrong, try again in a few minutes.')
            .ariaLabel('takealot.com')
            .ok('OK')
        );
    };

    $scope.enquire = function() {
        $scope.enq = {
            fullName: $scope.name,
            email: $scope.email,
            number: $scope.number,
            order: $scope.order,
            comment: $scope.comment,
            issues: $scope.Issues
        }

        if ($scope.name == undefined || $scope.email == undefined || $scope.number == undefined || $scope.order == undefined || $scope.comment == undefined || $scope.Issues == undefined) {
            fail();
        } else {
            $http.put(enquireURL, $scope.enq).then(function(response) {
                    if (response) {
                        success();
                    } else {
                        connFail();
                    }
                }),
                function(error) {
                    return error;
                }
        }
    }

})

.controller('ProfileCtrl', function($scope, $http) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    $scope.loggedUser = user.name;

    if ($scope.loggedUser == null)
        window.location = "../../views/login.html";

})

.controller('CheckoutCtrl', function($scope, $http, $mdDialog) {
    var user = JSON.parse(window.localStorage.getItem('takealot_user'));
    var userId = JSON.parse(window.localStorage.getItem('takealot_userId'));

    function fail() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Enquiry')
            .textContent('Make sure you have filled in all the required fields, try again.')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            $scope.addAddress();
        })
    };

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

    function noAddress() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Address Required')
            .textContent('You must add an address before you can continue.')
            .ariaLabel('takealot.com')
            .ok('OK')
        );
    };

    function noAddrSelected() {
        $mdDialog.show(
            $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('Address Required')
            .textContent('You must select an address before you can continue.')
            .ariaLabel('takealot.com')
            .ok('OK')
        );
    };

    var addresses;
    var adArray = [];
    $http.get(checkoutURL).then(function(response) {
        if (response) {
            addresses = response.data;

            for (var id in addresses) {
                if (userId.loggedId == addresses[id].customerId) {
                    var getAddressData = {
                        customerId: addresses[id].customerId,
                        addressId: addresses[id].addressId,
                        recipientName: addresses[id].recipientName,
                        deliveryContactNo: addresses[id].deliveryContactNo,
                        addressType: addresses[id].addressType,
                        buildingDetails: addresses[id].buildingDetails,
                        streetAddress: addresses[id].streetAddress,
                        suburb: addresses[id].suburb,
                        city: addresses[id].city,
                        postalCode: addresses[id].postalCode
                    }
                    adArray.push(getAddressData);
                    $scope.adExist = true;
                }
            }
            $scope.addresses = adArray;
            console.log(adArray)
        } else {
            connFail();
        }
    })

    $scope.addAddress = function(ev) {
        $mdDialog.show({
                templateUrl: '../../patials/addAddress.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            })
            .then(function() {
                console.log("Ädded address")
            }, function() {
                console.log("Cancel dialog")
            });
    }
    $scope.hide = function() {
        $mdDialog.hide();
    };

    $scope.cancel = function() {
        $mdDialog.cancel();
    };

    $scope.add = function() {
        $scope.sendData = {
            customerId: userId.loggedId,
            addressId: "",
            recipientName: $scope.recipientName,
            deliveryContactNo: $scope.deliveryContactNo,
            addressType: $scope.addressType,
            buildingDetails: $scope.buldingDetails,
            streetAddress: $scope.streetAddress,
            suburb: $scope.suburb,
            city: $scope.city,
            postalCode: $scope.postalCode
        }
        console.log($scope.sendData)
        if ($scope.recipientName == undefined || $scope.deliveryContactNo == undefined || $scope.addressType == undefined || $scope.streetAddress == undefined || $scope.suburb == undefined || $scope.city == undefined || $scope.postalCode == undefined) {
            fail();
        } else {
            $http.put(checkoutURL, $scope.sendData).then(function(response) {
                    if (response) {
                        window.location = "../../views/checkout.html";
                    } else {
                        connFail();
                    }
                }),
                function(error) {
                    return error;
                }
        }
        $mdDialog.hide();
    };

    $scope.checkout = function(ad) {
        console.log(ad)
        if ($scope.adExist) {
            if (ad != null || ad != undefined) {
                address = JSON.parse(ad);
                var id = {
                    id: address.addressId
                }
                window.localStorage.addrId = JSON.stringify(id)
                window.location = "../../views/summary.html";
            } else {
                noAddrSelected();
            }
        } else {
            noAddress();
        }
    }
})

.controller('SummaryCtrl', function($scope, $http, $mdDialog) {
    var cart = JSON.parse(window.localStorage.getItem('cart'));
    var loggedUser = JSON.parse(window.localStorage.getItem('takealot_userId'));
    var addressId = JSON.parse(window.localStorage.getItem('addrId'));

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

    function paypalCancel() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('PayPal Cancellation')
            .textContent('You have just cancelled your payment. Enjoy shopping at takealot.com.')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            window.location = "../../views/cart.html";
        })
    };

    function paypalSuccess() {
        var ok = $mdDialog.alert()
            .clickOutsideToClose(true)
            .title('PayPal Success')
            .textContent('Payment successful, thanks for using PayPal.')
            .ariaLabel('takealot.com')
            .ok('OK');
        $mdDialog.show(ok).then(function() {
            var orderedItems = cart;

            $http.post(orderedProductsURL, orderData).then(function(response) {

            })

            $http.get(orderedProductsURL).then(function(response) {

                }),
                function(error) {
                    return error;
                }
            for (var i in orderedItems) {

            }
            window.localStorage.removeItem('cart');
            window.location = "../../views/home.html";
        })
    };

    var data;
    var address = [];
    $http.get(checkoutURL).then(function(response) {
        if (response) {
            data = response.data;
            for (var id in data) {
                if (addressId.id == data[id].addressId) {
                    var getAddres = {
                        recipientName: data[id].recipientName,
                        deliveryContactNo: data[id].deliveryContactNo,
                        addressType: data[id].addressType,
                        buildingDetails: data[id].buildingDetails,
                        streetAddress: data[id].streetAddress,
                        suburb: data[id].suburb,
                        city: data[id].city,
                        postalCode: data[id].postalCode
                    }
                } else {}
            }
            address.push(getAddres);
            $scope.address = address;
        } else {
            connFail();
        }
    })

    var items = [];
    var cartTotal = 0;
    $http.get(productURL).then(function(response) {
        if (response) {
            var prod = response.data;
            for (var id in cart) {
                for (var i in prod) {
                    if (cart[id].productId == prod[i].productId) {
                        var cartProd = {
                            price: prod[i].price,
                            description: prod[i].description,
                            // quantity: prod[id].quantity,
                            // availability: prod[id].availability
                        }
                    } else {}
                }

                items.push(cartProd);
                $scope.orders = items;
            }

        } else { connFail(); }
        for (var id in items) {
            cartTotal += items[id].price;
        }
        $scope.cartTotal = cartTotal;
        if (cartTotal >= 1000) {
            $scope.shipping = true;
            $scope.shippingPrice = 0
        } else {
            $scope.shipping = false;
            $scope.cartTotal += 60;
            $scope.shippingPrice = 60;
        }
    })

    paypal.Button.render({

        env: 'sandbox', // Specify 'sandbox' for the test environment

        client: {
            sandbox: 'AVoi70dh2d_qgYQ1UNWV-mNG_VK2wTbip6OS877CtHnpYtnhU4GS2uJR6HMlqPwuibGobMnW3htaXcWh',
        },

        style: {
            size: 'medium',
            color: 'blue',
            shape: 'pill'
        },
        payment: function() {
            // Set up the payment here, when the buyer clicks on the button
            var env = this.props.env;
            var client = this.props.client;

            return paypal.rest.payment.create(env, client, {
                intent: "sale",
                payer: {
                    "payment_method": "paypal"
                },
                transactions: [{
                    amount: {
                        total: $scope.cartTotal,
                        currency: 'USD'
                    },
                    description: 'Payment from takealot.com user to Reverside Paypal account.',
                    item_list: {
                        shipping_address: {
                            recipient_name: $scope.address[0].recipientName,
                            line1: $scope.address[0].buildingDetails,
                            line2: $scope.address[0].streetAddress,
                            city: $scope.address[0].city,
                            country_code: "ZA",
                            postal_code: $scope.address[0].postalCode,
                            phone: $scope.address[0].deliveryContactNo,
                            state: ""
                        }
                    }
                }]
            });

        },
        commit: true,
        onAuthorize: function(data, actions, error) {
            // Execute the payment here, when the buyer approves the transaction
            if (error === 'INSTRUMENT_DECLINED') {
                function paypalInsufient() {
                    var ok = $mdDialog.confirm()
                        .clickOutsideToClose(true)
                        .title('Insuffitient Funds')
                        .textContent('You do not enough funds in your account, try a different payment method.')
                        .ariaLabel('takealot.com')
                        .ok('OK');
                    $mdDialog.show(ok).then(function() { actions.restart(); })
                };
                paypalInsufient();
            }

            return actions.payment.execute().then(function() {
                // Show a success page to the buyer
                paypalSuccess();
            });
        },
        onCancel: function(error) {
            paypalCancel();
        }

    }, '#paypal-button');

})