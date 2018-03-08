angular.module('app.spinalforge.plugin')
  .controller('fileCtrl', ["$scope", "$mdDialog", "FilePanelService", "authService",
    function ($scope, $mdDialog, FilePanelService, authService) {
      let onChange = () => {
        let obj = FileSystem._objects[$scope.files._server_id];
        $scope.files = obj.get_obj();
        $scope.$apply();
      };

      FilePanelService.register((annotation) => {
        if ($scope.files) {
          let obj = FileSystem._objects[$scope.files._server_id];
          if (obj)
            obj.unbind(onChange);
        }
        if (annotation) {
          $scope.files = annotation;
          let obj = FileSystem._objects[$scope.files._server_id];
          if (obj)
            obj.bind(onChange);
        }
      });

      $scope.user = authService.get_user();

      $scope.deleteFile = (file) => {
        console.log(file);
        var dialog = $mdDialog.confirm()
          .ok("Delete !")
          .title('Do you want to remove it?')
          .cancel('Cancel')
          .clickOutsideToClose(true);

        $mdDialog.show(dialog)
          .then((result) => {
            let mod = FileSystem._objects[$scope.files._server_id];
            if (mod) {
              for (var i = 0; i < mod.files.length; i++) {
                if (mod.files[i]._server_id == file._server_id) {
                  mod.files.splice(i, 1);
                } else {
                  console.log(mod.files[i]._server_id);
                  console.log(file._server_id);
                }
              }
            } else console.log("mod null");
          }, function () {});
      };

      $scope.downloadPtrFunc = (selected) => {
        return (model, error) => {
          if (model instanceof Path) {
            // window.open("/sceen/_?u=" + model._server_id, "Download");
            var element = document.createElement('a');
            element.setAttribute('href', "/sceen/_?u=" + model._server_id);
            element.setAttribute('download', selected.name);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
          }
        };
      };

      $scope.downloadFile = (file) => {
        let mod = FileSystem._objects[$scope.files._server_id];
        for (let i = 0; i < mod.files.length; i++) {
          if (mod.files[i]._server_id == file._server_id) {
            selected.load($scope.downloadPtrFunc(selected));
            break;
          }
        }
      };

      window.handle_files = (event) => {
        let mod = FileSystem._objects[$scope.files._server_id];
        var filePath;
        if (event.target) {
          if (mod) {
            for (let i = 0; i < event.target.files.length; i++) {
              const element = event.target.files[i];
              filePath = new Path(element);
              mod.files.force_add_file(element.name, filePath);
              $scope.$apply();
            }
          }
        }
      };

    }
  ]);