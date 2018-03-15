(function () {
  angular.module('app.spinalforge.plugin')
    .controller('allObjectCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "createPanelfactory",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, groupPanelService, allObjectService, createPanelfactory) {

        $scope.selectedAlert = null;
        $scope.selectedGroup = null;
        $scope.allObject = null;
        $scope.alertList = null;
        $scope.referencial = null;

        // selected Alert function call
        allObjectService.register(callback);

        function callback(mod, selectedObject) {
          if (mod) {
            $scope.selectedAlert = mod;
            if (selectedObject == null)
              $scope.selectedGroup = mod;
            else
              $scope.selectedGroup = selectedObject;
            if ($scope.selectedAlert.referencial) {
              $scope.selectedGroup.referencial.bind($scope.onRefChange);
              $scope.selectedAlert = $scope.selectedAlert.referencial;
              $scope.referencial = $scope.selectedAlert.referencial;
            }
            console.log("ici est la liste des allObject");
            // console.log($scope.selectedAlert);
            // console.log($scope.selectedGroup);
            $scope.allObject = mod.allObject;
            // $scope.$apply();
            $scope.selectedGroup.bind($scope.onModelChange);
          }
          // $scope.openAlertList();
        }

        $scope.onModelChange = () => {
          $scope.openAlertList();
          $scope.$apply();
        };

        $scope.remItemInReferencial = (item) => {
          for (let i = 0; i < $scope.referencial.allObject.length; i++) {
            const element = $scope.referencial.allObject[i];
            if (item.dbId.get() == element.dbId.get())
              $scope.referencial.allObject.splice(i, 1);
          }
        };
        $scope.$on('colorpicker-closed', function (data1, data2) {
          console.log(data1);
          console.log(data2);
          data1.targetScope.selectedAlert.color.set(data2.value);
        });

        $scope.onRefChange = () => {
          console.log("referencial change");
          let innerGroup = true;
          let group = $scope.selectedGroup.group;
          var referencial = $scope.selectedGroup.referencial.allObject;
          for (let j = 0; j < group.length; j++) { // all group
            group[j].allObject.clear();
          }
          for (let i = 0; i < referencial.length; i++) { // all referencial object
            const refObject = referencial[i];
            for (let j = 0; j < group.length; j++) { // all group
              if (refObject.group.get() == group[j].id.get())
                group[j].allObject.push(refObject);
            }
          }
          $scope.referencial = $scope.selectedGroup.referencial;
          console.log("end referencial change");
        };

        $scope.openAlertList = () => {

          const element = $scope.selectedGroup.referencial;
          $scope.alertList = [];
          $scope.alertList.push(element);


          for (let i = 0; i < $scope.selectedGroup.group.length; i++) {
            const element = $scope.selectedGroup.group[i];
            $scope.alertList.push(element);
          }

          // console.log($scope.alertList);
        };



        $scope.addAlertInGroup = (object, alert) => {
          console.log("addAlertInGroup");
          console.log(alert);
          console.log(object);
          object.group.set(alert.id.get());
        };

        $scope.getGroupName = (object) => {
          if ($scope.alertList) {
            for (let i = 0; i < $scope.alertList.length; i++) {
              if (object.group.get() == $scope.alertList[i].id.get())
                return ($scope.alertList[i].name.get());
            }
          }
        };

      }
      // end of controller
    ]);
})();