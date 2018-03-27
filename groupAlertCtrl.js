(function () {
  angular.module('app.spinalforge.plugin')
    .controller('groupAlertCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "createPanelfactory", "donutService",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, groupPanelService, allObjectService, createPanelfactory, donutService) {
        var viewer = v;
        $scope.changeColor = null;

        var callback = () => {
          $scope.$apply();
        };
        $scope.selectedObject = createPanelfactory.getSelected();
        createPanelfactory.getSelected().bind(callback);

        $scope.group = $scope.selectedObject.group;


        $scope.colorClick = ($event) => {
          console.log("colorClick");
          console.log($event);
        }

        $scope.viewAllAlert = (groupAlert) => {

          let tab = [];
          if (groupAlert.referencial.display.get()) {
            for (let i = 0; i < groupAlert.group.length; i++) {
              const alert = groupAlert.group[i];
              alert.display.set(false);
            }
            groupAlert.referencial.display.set(false);
          } else {
            for (let i = 0; i < groupAlert.group.length; i++) {
              const alert = groupAlert.group[i];
              alert.display.set(true);
            }
            groupAlert.referencial.display.set(true);
          }
        };


        $scope.renameReferencial = (selectedGroup) => {
          $mdDialog.show($mdDialog.prompt()
              .title("Rename")
              .placeholder('Please enter the title')
              .ariaLabel('Rename')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Confirm').cancel('Cancel'))
            .then(function (result) {
              let mod = FileSystem._objects[selectedGroup.referencial._server_id];

              // console.log(mod);

              if (mod) {
                if (mod.name)
                  mod.name.set(result);
                else {
                  mod.name.set(result);
                }
              }
            }, () => {});
        };

        $scope.addAlertInGroup = (selectedGroup) => {
          $mdDialog.show($mdDialog.prompt()
              .title("Add alert")
              .placeholder('Please enter the title of your alert')
              .ariaLabel('Add alert')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Confirm')
              .cancel('Cancel')
            )
            .then(function (result) {
              let mod = FileSystem._objects[selectedGroup._server_id];

              var alert = new groupAlert();
              // console.log(alert);
              alert.name.set(result);
              alert.id.set(mod.group.length + 1);

              if (mod) {
                mod.group.push(alert);
              } else {
                console.log("mod null");
              }

            }, () => {
              console.log("canceled")
            });
        };


        $scope.donut = (groupArrange) => {

          donutService.hideShowPanel("donutCtrl", "donutTemplate.html", groupArrange);
        };

        $scope.renameAlert = (alert) => {
          $mdDialog.show($mdDialog.prompt()
              .title("Rename")
              .placeholder('Please enter the title')
              .ariaLabel('Rename')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Confirm').cancel('Cancel'))
            .then(function (result) {
              let mod = FileSystem._objects[alert._server_id];

              // console.log(mod);

              if (mod) {
                if (mod.name)
                  mod.name.set(result);
                else {
                  mod.name.set(result);
                }
              }
            }, () => {});
        };




        $scope.deleteAlert = (theme, note = null) => {
          var dialog = $mdDialog.confirm()
            .ok("Delete !")
            .title('Do you want to remove it?')
            .cancel('Cancel')
            .clickOutsideToClose(true);

          $mdDialog.show(dialog)
            .then((result) => {
              let id = theme.id.get();
              for (let i = 0; i < $scope.group.length; i++) {
                const selectedGroup = $scope.group[i];
                if (theme.name.get() == selectedGroup.name.get()) {
                  $scope.group.splice(i, 1);
                  for (i; i < $scope.group.length; i++) {
                    $scope.group[i].id.set($scope.group[i].id - 1);
                  }
                }
              }
              let tmpAllObject = $scope.selectedObject.allObject;
              // console.log(tmpAllObject);
              for (let i = 0; i < tmpAllObject.length; i++) {
                const element = tmpAllObject[i];
                // console.log(element);
                if (element.group.get() == id) {
                  element.group.set(0);
                  restoreColor(element);
                }

              }
            }, () => {});
        };


        $scope.selectAlarm = (element) => {
          $scope.selectedAlarm = element;
          allObjectService.hideShowPanel(element, $scope.selectedObject);
        };


        $scope.viewAllObject = (theme) => {
          allObjectService.hideShowPanel(theme);
        };

        $scope.viewAlarm = (alert) => {
          // console.log($scope.selectedObject);
          if ($scope.selectedObject.referencial.display.get() == false)
            $scope.selectedObject.referencial.display.set(true);
          if (alert.display.get()) {
            // $scope.changeItemColor(alert);
            alert.display.set(false);
          } else {
            // $scope.restoreColor(alert);
            alert.display.set(true);
          }
        };

        $scope.changeItemColor = (alert) => {
          // console.log("changeItemColor");
          let dbIdList = [];
          for (let i = 0; i < alert.allObject.length; i++) {
            const bimObject = alert.allObject[i];
            dbIdList.push(bimObject.dbId.get());
          }
          viewer.setColorMaterial(dbIdList, alert.color.get(), alert._server_id);
        };


        function restoreColor(item) {
          viewer.restoreColorMaterial([item.dbId.get()], item._server_id);
        }


        $scope.$on('colorpicker-closed', function (data1, data2) {
          data1.stopPropagation();
          if (data2.name == "nimp.color")
            data1.targetScope.selectedObject.referencial.color.set(data2.value);
          else
            data1.targetScope.alarm.color.set(data2.value);
        });
      }
      // end of controller
    ]);
})();