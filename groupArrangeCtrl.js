(function () {
  angular.module('app.spinalforge.plugin')
    .controller('groupArrangeCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "messagePanelService", "FilePanelService",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, messagePanelService, FilePanelService) {
        var viewer = v;
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
              console.log($scope.selectedGroup);
              if ($scope.selectedNote && $scope.selectedNote._server_id == note._server_id) {
                $scope.selectedNote = note;
              }

              // $scope.$apply();

              // chcck if aplly color
            }

            // messagePanelService.
          });

        };

        // console.log("selectedGroup");
        // console.log($scope.selectedGroup);
        // console.log("selectedGroup");
        // $scope.selectedGroup = () => {
        //   for (let i = 0; i < $scope.themes.length; i++) {
        //     if ($scope.selectedGroup == $scope.themes[i].name) {
        //       console.log("group selected is:");
        //       console.log($scope.themes[i].name);
        //     }

        //   }
        // }, () => {};


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

        $scope.$on('colorpicker-closed', function (data1, data2) {

          // console.log(data1);
          // console.log(data2);

          // update moedels via $scope.themes
          for (var i = 0; i < $scope.themes.length; i++) {
            let note = $scope.themes[i];
            console.log("repere");
            console.log(note);
            for (var j = 0; j < note.group.length; j++) {
              let annotation = note.group[j];
              console.log(annotation);
              let tmp = annotation.color;
              let mod = FileSystem._objects[annotation._server_id];
              console.log(mod);
              console.log(tmp);

              // if (mod) {
              mod.color.set()
              // }
            }
          }
        });

        $scope.selectedNote = null;

        $scope.selectedStyle = (note) => {
          if (note.group) {

          }
          return note === $scope.selectedNote ? "background-color: #4185f4" : '';
        };

        $scope.getViewIcon = (note) => {

          return note.display ? "fa-eye-slash" : "fa-eye";
        };

        $scope.selectNote = (note) => {
          $scope.selectedNote = note;
          console.log(note);
        };

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

        $scope.ViewAllNotes = (theme) => {

          if (theme.display) {
            $scope.restoreColor(theme);
          } else {
            $scope.changeItemColor(theme);
          }

          // theme.display = !theme.display;

        };

        $scope.addNoteInTheme = (theme) => {
          $mdDialog.show($mdDialog.prompt()
              .title("Add group")
              .placeholder('Please enter the title')
              .ariaLabel('Add group')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Confirm')
              .cancel('Cancel')
            )
            .then(function (result) {
              let mod = FileSystem._objects[theme._server_id];


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


        $scope.addItemInNote = (annotation) => {

          var items = viewer.getSelection();

          if (items.length == 0) {
            alert('No model selected !');
            return;
          }

          viewer.model.getBulkProperties(items, {
            propFilter: ['name']
          }, (models) => {
            console.log("/////////////////////////////////////////");
            console.log(models);
            let mod = FileSystem._objects[annotation._server_id];
            console.log(mod);
            console.log(models.dbid);
            console.log(models.name);
            if (mod) {
              for (var i = 0; i < models.length; i++) {
                var newBimObject = new bimObject();
                newBimObject.dbid.set(models.dbid);
                newBimObject.name.set(models.name);
                mod.allObject.push(newBimObject);
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

            mod.display.set(false);

            viewer.restoreColorMaterial(ids, mod._server_id);
          }

        }


        $scope.commentNote = (theme) => {
          messagePanelService.hideShowPanel(theme);
        };

        $scope.sendFile = (theme) => {
          FilePanelService.hideShowPanel(theme);
        }



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