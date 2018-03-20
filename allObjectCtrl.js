(function () {
  angular.module('app.spinalforge.plugin')
    .controller('allObjectCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "createPanelfactory", "donutService",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, groupPanelService, allObjectService, createPanelfactory, donutService) {

        var viewer = v;
        $scope.selectedAlert = null;
        $scope.selectedObject = null;
        $scope.allObject = null;
        $scope.alertList = null;
        $scope.referencial = null;
        $scope.tree = viewer.model.getInstanceTree();

        // selected Alert function call
        allObjectService.register(callback);

        function callback(mod, selectedObject) {
          if (mod) {
            $scope.selectedAlert = mod;
            if (selectedObject == null)
              $scope.selectedObject = mod;
            else
              $scope.selectedObject = selectedObject;
            if ($scope.selectedAlert.referencial) {
              $scope.selectedObject.referencial.bind($scope.onRefChange);
              $scope.selectedAlert = $scope.selectedAlert.referencial;
              $scope.referencial = $scope.selectedAlert.referencial;
            }

            console.log("ici est la liste des allObject");
            // console.log($scope.selectedAlert);
            // console.log($scope.selectedObject);
            $scope.allObject = mod.allObject;
            // $scope.$apply();
            $scope.selectedObject.bind($scope.onModelChange);
          }
          // $scope.openAlertList();
        }

        $scope.onModelChange = () => {
          $scope.openAlertList();
          $scope.$apply();
        };

        $scope.viewReferencial = (selectedObject) => {
          let refSelected = [];
          if (selectedObject.referencial.display.get()) {
            let color = selectedObject.referencial.color.get();
            for (let i = 0; i < selectedObject.referencial.allObject.length; i++) {
              const element = selectedObject.referencial.allObject[i];
              refSelected.push(element.dbId.get());
            }
            viewer.select(refSelected);
            selectedObject.referencial.display.set(false);
          } else {
            for (let i = 0; i < selectedObject.referencial.allObject.length; i++) {
              const element = selectedObject.referencial.allObject[i];
              refSelected.push(element.dbId.get());
            }
            viewer.select();
            selectedObject.referencial.display.set(true);
          }
        };

        $scope.selectBimObject = (bimObject) => {
          viewer.select(bimObject.dbId.get());
        };


        $scope.viewAllObject = (theme) => {
          allObjectService.hideShowPanel(theme);
        };

        function viewItemColor(item, color) {
          console.log("restore color");
          console.log(item);
          viewer.setColorMaterial([item.dbId.get()], color, item._server_id);
        }

        $scope.remItemInReferencial = (item) => {
          for (let i = 0; i < $scope.referencial.allObject.length; i++) {
            const element = $scope.referencial.allObject[i];
            if (item.dbId.get() == element.dbId.get()) {
              restoreColor(item);
              $scope.referencial.allObject.splice(i, 1);
            }
          }
        };

        $scope.remAllItemInReferencial = (object) => {
          console.log(object);
          for (let i = 0; i < object.referencial.allObject.length; i++) {
            const element = object.referencial.allObject[i];
            restoreColor(element);
            // viewer.restoreColorMaterial([element.dbId.get()], element._server_id);
          }
          object.referencial.allObject.splice(0, object.referencial.allObject.length);
        };

        function restoreColor(item) {
          console.log("restore color");
          console.log(item);
          viewer.restoreColorMaterial([item.dbId.get()], item._server_id);
        }

        $scope.$on('colorpicker-closed', function (data1, data2) {
          console.log(data1);
          console.log(data2);
          data1.targetScope.selectedAlert.color.set(data2.value);
        });

        $scope.onRefChange = () => {
          console.log("referencial change");
          let innerGroup = true;
          let group = $scope.selectedObject.group;
          var referencial = $scope.selectedObject.referencial.allObject;
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
          $scope.referencial = $scope.selectedObject.referencial;
          console.log("end referencial change");
        };

        $scope.donut = (groupArrange) => {

          donutService.hideShowPanel("donutCtrl", "donutTemplate.html", groupArrange);
          // donutService.hideShowPanel("donutCtrl", "donutTemplate.html", groupArrange);
        };

        $scope.openAlertList = () => {

          const element = $scope.selectedObject.referencial;
          $scope.alertList = [];
          $scope.alertList.push(element);


          for (let i = 0; i < $scope.selectedObject.group.length; i++) {
            const element = $scope.selectedObject.group[i];
            $scope.alertList.push(element);
          }

          // console.log($scope.alertList);
        };



        $scope.addItemInReferencial = (note) => {

          var items = viewer.getSelection();
          console.log("addItemInReferencial");
          console.log("items");
          if (items.length == 0) {
            alert('No model selected !');
            return;
          }

          viewer.model.getBulkProperties(items, {
            propFilter: ['name']
          }, (models) => {
            let mod = FileSystem._objects[note._server_id];
            console.log("ici est l'éxecution de additem in referencial")
            console.log(mod);
            console.log(models);
            console.log($scope.tree);


            let valide = true;
            if (mod) {
              for (var i = 0; i < models.length; i++) {
                for (let j = 0; j < mod.allObject.length; j++) {
                  if (mod.allObject[j].dbId.get() == models[i].dbId)
                    valide = false;
                }
                if (valide) {
                  $scope.tree.enumNodeChildren(models[0].dbId, (child) => {
                    if ($scope.tree.getChildCount(child) == 0) {
                      var newBimObject = new bimObject();
                      newBimObject.dbId.set(child);
                      newBimObject.name.set(viewer.model.getData().instanceTree.getNodeName(child));
                      newBimObject.group.set(0);
                      mod.allObject.push(newBimObject);
                    }
                  }, true);
                }
                valide = true;
              }

              var toast = $mdToast.simple()
                .content("Item added !")
                .action('OK')
                .highlightAction(true)
                .hideDelay(0)
                .position('bottom right')
                .parent("body");

              $mdToast.show(toast);

            }

          });

        };



        $scope.addAlertInGroup = (object, alert) => {
          console.log("addAlertInGroup");
          object.group.set(alert.id.get());
        };


        $scope.getColorObject = (object) => {
          if ($scope.alertList) {
            for (let i = 0; i < $scope.alertList.length; i++) {
              if (object.group.get() == $scope.alertList[i].id.get())
                return ($scope.alertList[i].color.get());
            }
          }
        };

        $scope.getColorAlert = (alert) => {
          return (alert.color.get());
        };

        $scope.heightColorMenu = (selectedObject) => {
          return ((selectedObject.group.length + 1) * 25);
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