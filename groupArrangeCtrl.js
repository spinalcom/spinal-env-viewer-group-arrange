(function () {
  angular.module('app.spinalforge.plugin')
    .controller('groupArrangeCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "createPanelService",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, groupPanelService, allObjectService, createPanelService) {
        var viewer = v;
        $scope.selectedGroupId = -1;
        $scope.selectedGroupAlarm = null;
        $scope.selectedAlarm = null;
        $scope.referencial = null;
        $scope.user = authService.get_user();
        $scope.headerBtnClick = (btn) => {
          console.log("headerBtnClick");
          console.log(btn);
          if (btn.label == "add group") {
            $scope.addGroup();
          }
        };

        $scope.headerBtn = [{
            label: "add group",
            icon: "note_add"
          }
          // ,
          // {
          //   label: "visibility",
          //   icon: "visibility",
          //   toggleIcon: ""
          // },
          // {
          //   label: "visibility cancel",
          //   icon: "visibility_off"
          // },
        ];
        $scope.currentVisibleObj = [];

        $scope.themes = [];
        spinalModelDictionary.init().then((m) => {
          if (m) {
            if (m.groupAnnotationPlugin) {
              m.groupAnnotationPlugin.load((mod) => {
                $scope.themeGroup = mod;
                $scope.themeGroup.bind($scope.onModelChange);
              });
            } else {
              $scope.themeGroup = new Lst();
              m.add_attr({
                groupAnnotationPlugin: new Ptr($scope.themeGroup)
              });
              $scope.themeGroup.bind($scope.onModelChange);
            }
          }
        });

        function deferObjRdy(model, promise) {
          // console.log(model, model._server_id);
          if (!model._server_id || FileSystem._tmp_objects[model._server_id]) {
            setTimeout(() => {
              deferObjRdy(model, promise);
            }, 200);
            return;
          }
          promise.resolve(model);
        }

        $scope.waitObjRdy = (model) => {
          let deferred = $q.defer();
          deferObjRdy(model, deferred);
          return deferred.promise;
        };



        $scope.onModelChange = () => {
          let promiseLst = [];
          for (var i = 0; i < $scope.themeGroup.length; i++) {
            let note = $scope.themeGroup[i];
            promiseLst.push($scope.waitObjRdy(note));
          }
          $q.all(promiseLst).then((res) => {
            $scope.themes = [];
            for (var i = 0; i < $scope.themeGroup.length; i++) {
              let note = $scope.themeGroup[i];
              $scope.themes.push(note);
              // $scope.selectedGroup = $scope.themes[1].name;

              if ($scope.selectedNote && $scope.selectedNote._server_id == note._server_id) {
                $scope.selectedNote = note;
              }
            }

            // $scope.selectedGroup = $scope.themeGroup[];


            // messagePanelService.
          });

        };


        // selection du menu deroulant
        $scope.selectedGroupFunc = () => {
          for (let i = 0; i < $scope.themeGroup.length; i++) {
            var element = $scope.themeGroup[i];
            console.log($scope.selectedGroupId);
            if (element.id.get() == $scope.selectedGroupId) {
              console.log("MYY IFFFFF");
              $scope.selectedGroup = element;
              console.log($scope.selectedGroup);
              $scope.selectedGroupAlarm = element.group;
            }
          }
        };

        // $scope.addPanel = () => {
        //   newPanel = new PanelClass(v, "message Panel");
        //   newPanel.container.style.right = "0px";
        //   newPanel.container.style.width = "400px";
        //   newPanel.container.style.height = "600px";
        //   newPanel.container.padding = "0px";

        //   var _container = document.createElement('div');
        //   _container.style.height = "calc(100% - 45px)";
        //   _container.style.overflowY = 'auto';
        //   newPanel.container.appendChild(_container);
        // }

        $scope.addGroup = () => {
          $mdDialog.show($mdDialog.prompt()
              .title("Add Theme")
              .placeholder('Please enter the Name')
              .ariaLabel('Add Theme')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Confirm').cancel('Cancel'))
            .then(function (result) {
              console.log("group add");
              console.log(result);


              var newGroup = new groupModel(result);
              newGroup.owner.set($scope.user.id);

              newGroup.id.set($scope.themeGroup.length);
              $scope.themeGroup.push(newGroup);

            }, () => {});
        }



        $scope.selectedNote = null;

        // $scope.selectedStyle = (note) => {
        //   if (note.group) {

        //   }
        //   return note === $scope.selectedNote ? "background-color: #4185f4" : '';
        // };

        $scope.getViewIcon = (note) => {

          return note.display ? "fa-eye-slash" : "fa-eye";
        };

        $scope.selectGroup = (element) => {
          console.log("select group")
          $scope.selectedGroup = element;
          console.log($scope.selectedGroup);

          createPanelService.hideShowPanel("groupAlertCtrl", "selectedGroupTemplate.html", element);

        };

        $scope.selectAlarm = (element) => {
          $scope.selectedAlarm = element;
          console.log("select alarm");
          console.log($scope.selectedAlarm);
          // allObjectCtrl.selectAlarmFunc(element);
          allObjectService.hideShowPanel(element);
        }

        $scope.renameNote = (note) => {
          $mdDialog.show($mdDialog.prompt()
              .title("Rename")
              .placeholder('Please enter the title')
              .ariaLabel('Rename')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Confirm').cancel('Cancel'))
            .then(function (result) {
              let mod = FileSystem._objects[note._server_id];

              console.log(mod);

              if (mod) {
                if (mod.title)
                  mod.title.set(result);
                else {
                  mod.name.set(result);
                }
              }
            }, () => {});
        };


        $scope.viewAllAlert = (groupAlert) => {
          console.log("ViewAllAlert");
          let tab = [];
          for (let i = 0; i < groupAlert.group.length; i++) {
            const alert = groupAlert.group[i];
            if (alert.display) {
              alert.display.set(false);
              $scope.restoreColor(alert);
            } else {
              $scope.changeItemColor(alert);
              alert.display.set(true);
            }
          }
        };

        $scope.viewAllObject = (theme) => {

          allObjectService.hideShowPanel(theme);
        };

        $scope.addAlertInGroup = (theme) => {
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
              let mod = FileSystem._objects[theme._server_id];
              console.log("my endpoint");
              console.log(mod);
              var annotation = new groupAlert();
              console.log(annotation);
              annotation.name.set(result);
              // annotation.owner.set($scope.user.id);
              // annotation.username.set($scope.user.username);

              if (mod) {
                mod.group.push(annotation);
              } else {
                console.log("mod null");
              }

            }, () => {
              console.log("canceled")
            });
        };

        $scope.deleteNote = (theme, note = null) => {
          console.log(note);
          var dialog = $mdDialog.confirm()
            .ok("Delete !")
            .title('Do you want to remove it?')
            .cancel('Cancel')
            .clickOutsideToClose(true);

          $mdDialog.show(dialog)
            .then((result) => {

              if (note != null) {
                for (var i = 0; i < $scope.themeGroup.length; i++) {
                  var themeS = $scope.themeGroup[i];
                  if (themeS._server_id == theme._server_id) {
                    for (var j = 0; j < themeS.group.length; j++) {
                      var annotation = themeS.group[j];

                      if (annotation._server_id == note._server_id) {
                        $scope.themeGroup[i].group.splice(j, 1);
                        break;
                      }
                    }
                    break;
                  }
                }
              } else {
                for (var _i = 0; _i < $scope.themeGroup.length; _i++) {
                  var _themeS = $scope.themeGroup[_i];
                  if (_themeS._server_id == theme._server_id) {
                    $scope.themeGroup.splice(_i, 1);
                    break;
                  }
                }
              }



            }, () => {})
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
            let valide = true;
            if (mod) {
              for (var i = 0; i < models.length; i++) {
                for (let j = 0; j < mod.allObject.length; j++) {
                  if (mod.allObject[j].dbid.get() == models[i].dbId)
                    valide = false;
                }
                if (valide) {
                  var newBimObject = new bimObject();
                  newBimObject.dbid.set(models[i].dbId);
                  newBimObject.name.set(models[i].name);
                  newBimObject.group.set(0);
                  mod.allObject.push(newBimObject);
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

          })

        }







        $scope.commentNote = (theme) => {
          // messagePanelService.hideShowPanel(theme);
        };

        $scope.sendFile = (theme) => {
          // FilePanelService.hideShowPanel(theme);
        }



        $scope.changeItemColor = (theme) => {
          var ids = [];
          // var selected;
          // var notes = this.model;
          // for (var i = 0; i < notes.length; i++) {
          //   if (notes[i].id == id) {
          //     selected = notes[i];
          //     for (var j = 0; j < selected.allObject.length; j++) {

          //       ids.push(selected.allObject[j].dbId.get());
          //     }
          //   }
          // }

          let mod = FileSystem._objects[theme._server_id];

          if (mod) {
            for (var i = 0; i < mod.allObject.length; i++) {
              ids.push(mod.allObject[i]);
            }

            mod.display.set(true);

            console.log(mod.color);

            viewer.setColorMaterial(ids, theme.color, mod._server_id);
          }
        }


        $scope.restoreColor = (theme) => {
          var ids = [];
          let mod = FileSystem._objects[theme._server_id];

          if (mod) {
            for (var i = 0; i < mod.allObject.length; i++) {
              ids.push(mod.allObject[i]);
            }
            mod.display.set(false);
            viewer.restoreColorMaterial(ids, mod._server_id);
          }
        };
        $scope.selectColor = (alarm) => {
          console.log("selectedColor");
          console.log(alarm);
        };
        $scope.$on('colorpicker-closed', function (data1, data2) {
          console.log(data1);
          console.log(data2);
          data1.targetScope.alarm.color.set(data2.value);
        });


        // changeAllItemsColor() {
        //   var objects = [];
        //   var notes = this.model;
        //   for (var i = 0; i < notes.length; i++) {
        //     var ids = [];
        //     var color;
        //     for (var j = 0; j < notes[i].allObject.length; j++) {
        //       ids.push(notes[i].allObject[j].dbId.get());
        //     }
        //     color = notes[i].color.get();
        //     objects.push({
        //       ids: ids,
        //       color: color,
        //       id: notes[i].id
        //     });
        //   }
        //   this.viewer.colorAllMaterials(objects);
        // }

        // restoreAllItemsColor() {
        //   var objects = [];
        //   var notes = this.model;
        //   for (var i = 0; i < notes.length; i++) {
        //     var ids = [];

        //     for (var j = 0; j < notes[i].allObject.length; j++) {
        //       ids.push(notes[i].allObject[j].dbId.get());
        //     }
        //     objects.push({
        //       ids: ids,
        //       id: notes[i].id
        //     });
        //   }
        //   this.viewer.restoreAllMaterialColor(objects);
        // }

      }
      // end of controller
    ]);
})();