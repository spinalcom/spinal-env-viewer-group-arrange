(function () {
  angular.module('app.spinalforge.plugin')
    .controller('donutCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "donutFactory",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, groupPanelService, allObjectService, donutFactory) {
        var viewer = v;
        var callback = () => {
          $scope.$apply();
        };
        $scope.selectedObject = donutFactory.getSelected();
        // $scope.selectedObject.bind($scope.donuts());
        donutFactory.getSelected().bind(callback);
        console.log("there is donut controller");
        console.log($scope.selectedObject);

        $scope.uid = layout_uid.get();
        $scope.getUID = () => {
          return ("mychart-" + $scope.uid);
        };

        $scope.donuts = () => {
          if (!$scope.data)
            $scope.data = {
              datasets: [{
                data: [],
                backgroundColor: []
              }],
              labels: [],
            };
          else {
            $scope.data.datasets[0].data.splice(0, $scope.data.datasets[0].data.length);
            $scope.data.datasets[0].backgroundColor.splice(0, $scope.data.datasets[0].backgroundColor.length);
            $scope.data.labels.splice(0, $scope.data.labels.length);
          }
          console.log($scope.data);
          let tmp = 0;
          for (let i = 0; i < $scope.selectedObject.referencial.allObject.length; i++) {
            const element = $scope.selectedObject.referencial.allObject[i];
            if (element.group.get() == 0)
              tmp++;
          }
          // console.log(tmp);
          $scope.data.datasets[0].data.push(tmp);
          $scope.data.labels.push($scope.selectedObject.referencial.name.get());
          $scope.data.datasets[0].backgroundColor.push($scope.selectedObject.referencial.color.get());
          // let percent;
          for (let i = 0; i < $scope.selectedObject.group.length; i++) {
            // console.log($scope.selectedObject.group[i].allObject.length);
            // percent = ($scope.selectedObject.group[i].allObject.length / $scope.selectedObject.referencial.allObject.length) + '%';
            $scope.data.datasets[0].data.push($scope.selectedObject.group[i].allObject.length);
            $scope.data.labels.push($scope.selectedObject.group[i].name.get());
            $scope.data.datasets[0].backgroundColor.push($scope.selectedObject.group[i].color.get());
          }
          console.log($scope.data);
          if ($scope.myDonut)

            $scope.myDonut.update();
          else {
            var ctx = document.getElementById($scope.getUID()).getContext('2d');

            $scope.myDonut = new Chart(ctx, {
              type: "doughnut",
              data: $scope.data,
              options: {
                legend: {
                  position: "right",
                  fontColor: "#000000"
                },
                responsive: false,
                animation: {
                  duration: 0
                }
              }
            });
          }
        };
        $scope.selectedObject.bind($scope.donuts);
      }
      // end of controller
    ]);
})();