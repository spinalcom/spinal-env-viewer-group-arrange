(function () {
  angular.module('app.spinalforge.plugin')
    .controller('groupAlertCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "createPanelfactory",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, groupPanelService, allObjectService, createPanelfactory) {
        var viewer = v;
        $scope.changeColor = null;

        var callback = () => {
          $scope.$apply();
        };
        $scope.selectedObject = createPanelfactory.getSelected();
        createPanelfactory.getSelected().bind(callback);
        console.log("there is groupAlert controller");
        console.log($scope.selectedObject);

        $scope.group = $scope.selectedObject.group;

        // $scope.group.bind($scope.onModelChange);

        $scope.colorClick = ($event) => {
          console.log("colorClick");
          console.log($event);
        }

        $scope.viewAllAlert = (groupAlert) => {
          console.log("ViewAllAlert");
          // console.log(groupAlert);
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

        // $scope.viewAllAlert = (groupAlert) => {
        //   console.log("ViewAllAlert");
        //   // let ref = [];
        //   // let onDisplay = [];
        //   // let offDisplay = [];
        //   // let estdedans = false;
        //   // for (let i = 0; i < groupAlert.referencial.allObject.length; i++) {
        //   //   const refBimObject = groupAlert.referencial.allObject[i];
        //   //   for (let j = 0; i < groupAlert.group.length; i++) {
        //   //     const alert = groupAlert.group[i];
        //   //     for (let k = 0; k < alert.allObject.length; k++) {
        //   //       const alertBimObject = alert.allObject[k];
        //   //       if (alertBimObject.name.get() == refBimObject.name.get())
        //   //         estdedans = true;
        //   //     }
        //   //   }
        //   // }

        //   for (let i = 0; i < groupAlert.group.length; i++) {
        //     const alert = groupAlert.group[i];

        //     if (alert.display) {
        //       alert.display.set(false);
        //       $scope.restoreColor(alert);
        //     } else {
        //       $scope.changeItemColor(alert);
        //       alert.display.set(true);
        //     }
        //   }

        // };

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
              console.log("my endpoint");
              console.log(mod);
              var alert = new groupAlert();
              console.log(alert);
              alert.name.set(result);
              alert.id.set(mod.group.length + 1);
              // alert.owner.set($scope.user.id);
              // alert.username.set($scope.user.username);

              if (mod) {
                mod.group.push(alert);
              } else {
                console.log("mod null");
              }

            }, () => {
              console.log("canceled")
            });
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

              console.log(mod);

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
          console.log(note);
          console.log(theme);
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
              console.log(tmpAllObject);
              for (let i = 0; i < tmpAllObject.length; i++) {
                const element = tmpAllObject[i];
                console.log(element);
                if (element.group.get() == id)
                  element.group.set(0);

              }
            }, () => {});
        };


        $scope.selectAlarm = (element) => {
          $scope.selectedAlarm = element;
          console.log("select alarm");
          console.log($scope.selectedAlarm);
          // allObjectCtrl.selectAlarmFunc(element);
          allObjectService.hideShowPanel(element, $scope.selectedObject);
        };


        $scope.viewAllObject = (theme) => {
          allObjectService.hideShowPanel(theme);
        };

        $scope.viewAlarm = (alert) => {
          if (alert.display.get()) {
            // $scope.changeItemColor(alert);
            alert.display.set(false);
          } else {
            // $scope.restoreColor(alert);
            alert.display.set(true);
          }
        };

        $scope.changeItemColor = (alert) => {
          console.log("changeItemColor");
          let dbIdList = [];
          for (let i = 0; i < alert.allObject.length; i++) {
            const bimObject = alert.allObject[i];
            dbIdList.push(bimObject.dbId.get());
          }
          viewer.setColorMaterial(dbIdList, alert.color.get(), alert._server_id);
        };


        $scope.restoreColor = (alert) => {
          console.log("restore color");
          let dbIdList = [];
          for (let i = 0; i < alert.allObject.length; i++) {
            const bimObject = alert.allObject[i];
            dbIdList.push(bimObject.dbId.get());
          }
          viewer.restoreColorMaterial(dbIdList, alert._server_id);
        };


        $scope.selectColor = (alarm) => {
          console.log("selectedColor");
          console.log(alarm);
        };

        $scope.$on('colorpicker-closed', function (data1, data2) {
          console.log(data1);
          console.log(data2);
          console.log(data1.targetScope.selectedAlarm);
          data1.stopPropagation();
          if (data2.name == "nimp.color")
            data1.targetScope.selectedAlarm.color.set(data2.value);
          else
            data1.targetScope.alarm.color.set(data2.value);
        });
      }
      // end of controller
    ]);
})();