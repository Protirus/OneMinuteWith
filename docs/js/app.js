var app = angular.module('app', ['ngRoute']);

app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'list.html',
                controller: 'MainCtrl',
                controllerAs: 'list'
            })
            .when('/Interview/:fileName', {
                templateUrl: 'interview.html',
                controller: 'InterviewCtrl',
                controllerAs: 'interview'
            });
        $locationProvider.html5Mode(true);
    }]
);

app.controller('MainCtrl', ['$scope', '$http', '$filter', '$route', '$routeParams', '$location',
    function ($scope, $http, $filter, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        $scope.location = window.location.pathname;
        //$scope.location = 'OneMinuteWith/';

        var req = {
            method: 'GET',
            url: 'https://api.github.com/repos/protirus/OneMinuteWith/contents/interviews/',
            // https://raw.githubusercontent.com/:owner/:repo/master/:path
            // https://raw.githubusercontent.com/Protirus/Tagger/master/README.md
            headers: {
                'Accept': 'application/vnd.github.mercy-preview+json'
            }
        };

        loadFiles = () => {
            $http(req)
                .then(function(response) {
                    angular.forEach(response.data, function(item) {
                        var fileName = item.name.substr(item.name.lastIndexOf('.')+1);
                        if (fileName === 'md') {
                            item.fileName = fileName;
                            $scope.files.push(item);
                        }
                    });
                }
            );
        };

        $scope.init = () => {
            $scope.files = [];
            loadFiles();
        };
        //$scope.init();
    }
]
);

app.controller('InterviewCtrl', ['$scope', '$http', '$routeParams',
    function ($scope, $http, $routeParams) {
        this.params = $routeParams;

        loadFile = (fileName) => {
            console.log(fileName);
            var url = 'https://raw.githubusercontent.com/Protirus/OneMinuteWith/master/interviews/' + fileName;
            $scope.url = url;
            console.log(url);
            // var req = {
            //     method: 'GET',
            //     url: url,
            //     headers: {
            //         'Accept': 'application/vnd.github.mercy-preview+json'
            //     }
            // };

            // $http(req)
            //     .then(function(response) {
            //         //console.log(response.data);
            //         $scope.contents = response.data;
            //         //$scope.$apply();
            //     }
            // );
        };

        $scope.init = () => {
            $scope.contents = '';
            console.log(this.params);
            loadFile(this.params["fileName"]);
        };
        //$scope.init();
    }
]
);

// http://jsfiddle.net/davidchase03/u54Kh/
app.directive('markdown', function () {
    var converter = new Showdown.converter();
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var htmlText = converter.makeHtml(element.text());
            element.html(htmlText);

            // function renderMarkdown() {
            //     var htmlText = converter.makeHtml(scope.$eval(attrs.markdown) || '');
            //     element.html(htmlText);
            // }
            // scope.$watch(attrs.markdown, renderMarkdown);
            // renderMarkdown();
            // scope.$watch('val', function(newValue, oldValue) {
            //     if (newValue)
            //         console.log("I see a data change!");
            // }, true);
        }
    };
});

app.filter('trusted', ['$sce', function ($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
}]);