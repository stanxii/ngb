'use strict';

angular.module('nggl', ['ngCookies', 'ngRoute',  'ngDateTime'])
    .config(['$routeProvider', '$locationProvider', '$httpProvider', function ($routeProvider, $locationProvider, $httpProvider, ngDateTime) {

    

    var access = routingConfig.accessLevels;

/*
    $routeProvider.when('/',
        {
            templateUrl:    '/partials/home.html',
            controller:     'HomeCtrl',
            access:         access.user
        });
*/        
     $routeProvider.when('/',
        {
            templateUrl:    '/partials/private.questions.top.html',
            controller:     'QuestionsTopCtrl',
            access:         access.user
        });    


    $routeProvider.when('/login',
        {
            templateUrl:    '/partials/login.html',
            controller:     'LoginCtrl',
            access:         access.anon
        });
    $routeProvider.when('/register',
        {
            templateUrl:    'partials/register.html',
            controller:     'RegisterCtrl',
            access:         access.anon
        });
    $routeProvider.when('/private',
        {
            templateUrl:    '/partials/private.html',
            controller:     'PrivateCtrl',
            access:         access.user
        });    
    $routeProvider.when('/questions/ask',
        {
            templateUrl:    '/partials/private.questions.ask.html',
            controller:     'QuestionsAskCtrl',
            access:         access.user,
            resolve:        {
                askGetMarkdown: function(askGetMarkdown){
                    return askGetMarkdown(); 
                }
            }
        });               
    $routeProvider.when('/questions/:qid',
        {
            templateUrl:    '/partials/private.questions.question.html',
            controller:     'QuestionsDetailCtrl',
            access:         access.user,
			resolve:        {
                getTopData: function(askGetMarkdown){
                    return askGetMarkdown(); 
                }
            }
        });       
    $routeProvider.when('/admin',
        {
            templateUrl:    '/partials/admin.html',
            controller:     'AdminCtrl',
            access:         access.admin
        });
    $routeProvider.when('/404',
        {
            templateUrl:    '/partials/404.html',
            access:         access.public
        });
    $routeProvider.otherwise({redirectTo:'/404'});

    $locationProvider.html5Mode(true);

    $httpProvider.interceptors.push(function($q, $location) {
        return {
            'responseError': function(response) {
                if(response.status === 401 || response.status === 403) {
                    $location.path('/login');
                    return $q.reject(response);
                }
                else {
                    return $q.reject(response);
                }
            }
        }
    });


    

}])

    .run(['$rootScope', '$location', '$http', 'Auth', function ($rootScope, $location, $http, Auth) {    
        $rootScope.accessors = {
            getId: function(row) {
            return row._id
            }
        }
        $rootScope.$on("$routeChangeStart", function (event, next, current) {
            $rootScope.error = null;
			 console.log('next access' + next.access.bitMask);
            if (!Auth.authorize(next.access)) {
                if(Auth.isLoggedIn()) $location.path('/');
                else                  $location.path('/login');
            }
        });

    }]);