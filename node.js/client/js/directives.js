'use strict';

angular.module('nggl')
.directive('accessLevel', ['Auth', function(Auth) {
    return {
        restrict: 'A',
        link: function($scope, element, attrs) {
            var prevDisp = element.css('display')
                , userRole
                , accessLevel;

            $scope.user = Auth.user;
            $scope.$watch('user', function(user) {
                if(user.role)
                    userRole = user.role;
                updateCSS();
            }, true);

            attrs.$observe('accessLevel', function(al) {
                if(al) accessLevel = $scope.$eval(al);
                updateCSS();
            });

            function updateCSS() {
                if(userRole && accessLevel) {
                    if(!Auth.authorize(accessLevel, userRole))
                        element.css('display', 'none');
                    else
                        element.css('display', prevDisp);
                }
            }
        }
    };
}]);


angular.module('nggl').directive('pagedownAdmin', function ($compile, $timeout) {
    var nextId = 0;
    var converter = Markdown.getSanitizingConverter();
    converter.hooks.chain("preBlockGamut", function (text, rbg) {
        return text.replace(/^ {0,3}""" *\n((?:.*?\n)+?) {0,3}""" *$/gm, function (whole, inner) {
            return "<blockquote>" + rbg(inner) + "</blockquote>\n";
        });
    });
  converter.hooks.chain("postConversion", function (text) {
    return text.replace(/<pre>/gi, "<pre class=prettyprint>");
});
    
    return {
        require: 'ngModel',
        replace: true,
        template: '<div class="pagedown-bootstrap-editor"></div>',
        link: function (scope, iElement, attrs, ngModel) {

            var editorUniqueId;

            if (attrs.id == null) {
                editorUniqueId = nextId++;
            } else {
                editorUniqueId = attrs.id;
            }

            var newElement = $compile(
                '<div>' +
                   '<div class="wmd-panel">' +
                      '<div id="wmd-button-bar-' + editorUniqueId + '"></div>' +
                      '<textarea class="wmd-input" id="wmd-input-' + editorUniqueId + '">' +
                      '</textarea>' +
                   '</div>' +
                   '<div id="wmd-preview-' + editorUniqueId + '" class="pagedown-preview wmd-panel wmd-preview"></div>' +
                '</div>')(scope);

            iElement.html(newElement);

            var help = function () {
                alert("There is no help");
            }

            var editor = new Markdown.Editor(converter, "-" + editorUniqueId, {
                handler: help
            });

            var $wmdInput = iElement.find('#wmd-input-' + editorUniqueId);

            var init = false;

            editor.hooks.chain("onPreviewRefresh", function () {
              var val = $wmdInput.val();
              if (init && val !== ngModel.$modelValue ) {
                $timeout(function(){
                  scope.$apply(function(){
                    ngModel.$setViewValue(val);
                    ngModel.$render();
                    prettyPrint();
                  });
                });
              }              
            });

            ngModel.$formatters.push(function(value){
              init = true;
              $wmdInput.val(value);
              editor.refreshPreview();
              return value;
            });

            editor.run();
        }
    }
});

angular.module('nggl').directive('activeNav', ['$location', function($location) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var nestedA = element.find('a')[0];
            var path = nestedA.href;

            scope.location = $location;
            scope.$watch('location.absUrl()', function(newPath) {
                if (path === newPath) {
                    element.addClass('active');
                } else {
                    element.removeClass('active');
                }
            });
        }

    };

}]);


angular.module('ngDateTime', [])
        .directive('ngDateTime', function() {
                var directive = {
                        template: '<div class="date-time-widget"><input type="date" ng-model="dateString"><input type="time" ng-model="timeString"></div>',
                        replace: true,
                        restrict: 'EA',
                        scope: {
                                model: '=model'
                        },
                        controller: ['$scope', '$element', '$attrs', function($scope, $element, $attrs) {
                                $scope.format = 'YYYY-MM-DD HH:mm';

                                $scope.updateStrings = function() {
                                        $scope.wrapper = moment($scope.model);

                                        $scope.dateString = $scope.wrapper.format('YYYY-MM-DD');
                                        $scope.timeString = $scope.wrapper.format('HH:mm');
                                };

                                $scope.updateModel = function() {
                                        $scope.wrapper = moment($scope.dateString + ' ' + $scope.timeString, $scope.format);
                                        $scope.model = $scope.wrapper.toDate();
                                };

                                $scope.updateDate = function() {
                                        var m = moment($scope.dateString, 'YYYY-MM-DD');

                                        if(m.isValid()) {
                                                $scope.updateModel();
                                        }
                                };

                                $scope.updateTime = function() {
                                        var m = moment($scope.timeString, 'HH:mm');

                                        if(m.isValid()) {
                                                $scope.updateModel();
                                        }
                                };

                                $scope.$watch('model', function(value) {
                                        $scope.updateStrings();
                                }, true);

                                $scope.$watch('dateString', function(value) {
                                        $scope.updateDate();
                                });

                                $scope.$watch('timeString', function(value) {
                                        $scope.updateTime();
                                });

                                $scope.updateStrings();
                        }]
                };

                return directive;
        })
        .filter('moment', function() {
                return function(dateString, format) {
                        format = format || 'YYYY-MM-DD HH:mm';

                        return moment(dateString).format(format);
                };
        });