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
            })
            // .otherwise({
            //     controller: 'MainCtrl'
            // });
            ;
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
            url: 'https://raw.githubusercontent.com/Protirus/OneMinuteWith/master/interviews/interviews.json',
            headers: {
                'Accept': 'application/vnd.github.mercy-preview+json'
            }
        };

        loadFiles = () => {
            $http(req)
                .then(function(response) {
                    angular.forEach(response.data, function(item) {
                        $scope.interviews.push(item);
                    });
                }
            );
        };

        $scope.init = () => {
            $scope.interviews = [];
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
            //console.log(fileName);
            var url = 'https://raw.githubusercontent.com/Protirus/OneMinuteWith/master/interviews/' + fileName;
            $scope.url = url;
            //console.log(url);

            var req = {
                method: 'GET',
                url: 'https://raw.githubusercontent.com/Protirus/OneMinuteWith/master/interviews/interviews.json',
                headers: {
                    'Accept': 'application/vnd.github.mercy-preview+json'
                }
            };
    
            loadInterviewData = (fileName) => {
                $http(req)
                    .then(function(response) {

                        var record = response.data.filter(element => element.fileName == fileName)[0];
                        var altText = "A picture of " + record.employeeName.fullName;
                    
                        $("#interview-pp-formal").attr("src", record.formalImageUrl);
                        $("#interview-pp-formal").attr("alt", altText);

                        $("#interview-pp-informal").attr("src", record.informalImageUrl);
                        $("#interview-pp-informal").attr("alt", altText);

                        // interview-fullname
                        $("#employee-fullname").text(record.employeeName.fullName);
                        $("#employee-role").text(record.employeeRole);
                    }
                );
            };

            //load image
            //set image src

            // $("#interview-pp").attr("src", "https://i.ibb.co/MhRMr7p/joebloggs.jpg");
        };

        $scope.init = () => {
            $scope.contents = '';
            console.log(this.params);
            loadFile(this.params["fileName"]);
            loadInterviewData(this.params["fileName"]);

            $( document ).ready(function() {
                SetProfilePictureFrameSize();
            });
        
            $(window).on('resize', function() {
                SetProfilePictureFrameSize();
            });
            $("html, body").scrollTop(0);
        };

        function SetProfilePictureFrameSize() {
            var cw = $('.pp-wrapper').width();
            $('.pp-frame').css({'height':cw+'px'});
        }
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