'use strict';

angular.module('nggl')
.factory('Auth', function($http, $cookieStore){

    var accessLevels = routingConfig.accessLevels
        , userRoles = routingConfig.userRoles
        , currentUser = $cookieStore.get('user') || { username: '', role: userRoles.public };

    $cookieStore.remove('user');

    function changeUser(user) {
        _.extend(currentUser, user);
    };

    return {
        authorize: function(accessLevel, role) {
            if(role === undefined)
                role = currentUser.role;

            return accessLevel.bitMask & role.bitMask;
        },
        isLoggedIn: function(user) {
            if(user === undefined)
                user = currentUser;
            return user.role.title == userRoles.user.title || user.role.title == userRoles.admin.title;
        },
        register: function(user, success, error) {
            $http.post('/register', user).success(function(res) {
                changeUser(res);
                success();
            }).error(error);
        },
        login: function(user, success, error) {
            $http.post('/login', user).success(function(user){
                changeUser(user);
                success(user);
            }).error(error);
        },
        logout: function(success, error) {
            $http.post('/logout').success(function(){
                changeUser({
                    username: '',
                    role: userRoles.public
                });
                success();
            }).error(error);
        },
        accessLevels: accessLevels,
        userRoles: userRoles,
        user: currentUser
    };
});

angular.module('nggl')
.factory('Users', function($http) {
    return {
        getAll: function(success, error) {
            $http.get('/users').success(success).error(error);
        }
    };
});

angular.module('nggl')
.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});


angular.module('nggl')
.factory('askGetMarkdown', ['socket', '$route', '$q', function(socket, $route, $q){
        return function(){
            var delay = $q.defer(),
            load = function(){
                $.getScript('/lib/markdown/Markdown.Converter.js',function(){
                    $.getScript('/lib/markdown/Markdown.Sanitizer.js',function(){
                        $.getScript('/lib/markdown/Markdown.Editor.js',function(){
                            delay.resolve();
                        });
                    });                
                });
            };
            load();
            return delay.promise;  
        };
}]);

angular.module('nggl')
.factory('getTopQuestionCSS', ['socket', '$route', '$q', function(socket, $scope, $q){
        return function(){
            var delay = $q.defer(),
            load = function(){
                $.getScript('/css/question.top.js',function(){                    
                            delay.resolve();                                
                });
            };
            load();
            return delay.promise;  
        };
}]);

