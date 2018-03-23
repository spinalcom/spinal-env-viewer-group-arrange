(function () {
  angular.module('app.spinalforge.plugin')
    .controller('groupArrangeCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "createPanelService", "donutService","$templateCache",
      function ($scope, $rootScope, $mdToast, $mdDialog, authService, $compile, $injector, layout_uid, spinalModelDictionary, $q, groupPanelService, allObjectService, createPanelService, donutService, $templateCache) {
        
        var viewer = v;
        $scope.selectedGroupId = -1;
        $scope.selectedGroupAlarm = null;
        $scope.selectedAlarm = null;
        $scope.referencial = null;
        $scope.user = authService.get_user();
        $scope.selectGroup = null;
        $scope.tree = viewer.model.getInstanceTree();
        $scope.headerBtnClick = (btn) => {
          console.log("headerBtnClick");
          console.log(btn);
          if (btn.label == "add group") {
            $scope.addGroup();
          }
        };
        //   uri: '../templates/spinal-env-viewer-group-arrange/selectedGroupTemplate.html',
        //   name: 'selectedGroupTemplate.html'

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

        $scope.allGroup = [];
        spinalModelDictionary.init().then((m) => {
          console.log("spinal model dictionary");
          if (m) {
            console.log(m);
            console.log(m.groupAlertPlugin);
            if (m.groupAlertPlugin) {
              m.groupAlertPlugin.load((mod) => {
                console.log("ON CHARGE LES DONNEE PRESENTE DANS GROUPE ANNOTATION PLUGIN");
                $scope.selectGroup = mod;
                $scope.selectGroup.bind($scope.onModelChange);
              });
            } else {
              console.log("delete of groupe annotation plugin");
              $scope.selectGroup = new Lst();
              m.add_attr({
                groupAlertPlugin: new Ptr($scope.selectGroup)
              });
              $scope.selectGroup.bind($scope.onModelChange);
            }
          }
        }, function () {
          console.log("model unreachable");
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
          for (var i = 0; i < $scope.selectGroup.length; i++) {
            let note = $scope.selectGroup[i];
            promiseLst.push($scope.waitObjRdy(note));
          }
          $q.all(promiseLst).then((res) => {
            $scope.allGroup = [];
            for (var i = 0; i < $scope.selectGroup.length; i++) {
              let note = $scope.selectGroup[i];
              $scope.allGroup.push(note);
              // $scope.selectedGroup = $scope.allGroup[1].name;

              if ($scope.selectedNote && $scope.selectedNote._server_id == note._server_id) {
                $scope.selectedNote = note;
              }
            }
            let ref = [];
            $scope.display(); // function for display all sensor
          });
        };

        $scope.display = () => {
          for (let i = 0; i < $scope.selectGroup.length; i++) {
            const selectedGroup = $scope.selectGroup[i];
            if (selectedGroup.referencial.display.get()) { // si le display du referenciel est true
              for (let j = 0; j < selectedGroup.referencial.allObject.length; j++) {
                const refObject = selectedGroup.referencial.allObject[j];
                if (refObject.on_off.get()) { // si l'item est allumé
                  if (refObject.group.get() == 0) { // si le groupe de l'objet est 0
                    console.log("l'objet est dans le referenciel");
                    console.log("on affiche l'objet avec la couleur du referenciel");
                    // ref.push(refObject.dbId.get());


                    if (selectedGroup.referencial.display.get())
                      viewer.setColorMaterial([refObject.dbId.get()], selectedGroup.referencial.color.get(), refObject._server_id);
                    else
                      viewer.restoreColorMaterial([refObject.dbId.get()], refObject._server_id);


                    // viewer.setColorMaterial([refObject.dbId.get()], selectedGroup.referencial.color.get(), refObject._server_id);
                    // viewer.restoreColorMaterial([refObject.dbId.get()], refObject._server_id);
                    // console.log(refObject);
                  } else {
                    // console.log("l'objet est dans un groupe");
                    for (let k = 0; k < selectedGroup.group.length; k++) {
                      const alert = selectedGroup.group[k];
                      if (refObject.group.get() == alert.id.get()) { // si l'objet est dans l'alert
                        if (alert.display.get()) { //si le display de l'alert est true
                          // console.log("on affiche l'objet avec la couleur de l'alert");
                          // console.log(refObject.dbId.get());
                          viewer.setColorMaterial([refObject.dbId.get()], alert.color.get(), refObject._server_id);
                        } else { // si le display de l'alert est false
                          // console.log("on delete l'affichage de l'objet");
                          viewer.restoreColorMaterial([refObject.dbId.get()], refObject._server_id);
                        }
                      }
                    }
                  }
                } else {
                  viewer.restoreColorMaterial([refObject.dbId.get()], refObject._server_id);
                }
              }
            } else {
              for (let j = 0; j < selectedGroup.referencial.allObject.length; j++) {
                const refObject = selectedGroup.referencial.allObject[j];
                viewer.restoreColorMaterial([refObject.dbId.get()], refObject._server_id);
              }
              console.log("referenciel display false");
            }
          }
        };


        $scope.donut = (groupArrange) => {

          donutService.hideShowPanel("donutCtrl", "donutTemplate.html", groupArrange);
          // donutService.hideShowPanel("donutCtrl", "donutTemplate.html", groupArrange);
        };


        // selection du menu deroulant
        $scope.selectedGroupFunc = () => {
          for (let i = 0; i < $scope.selectGroup.length; i++) {
            var element = $scope.selectGroup[i];
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
              .title("add Group")
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

              newGroup.id.set($scope.selectGroup.length);
              $scope.selectGroup.push(newGroup);

            }, () => {});
        };


        $scope.export = (theme) => {
          console.log(theme);
          spinalModelDictionary.init().then((m) => {
            if (m) {
              console.log(m);
              if (m.validationPlugin) {
                m.validationPlugin.load((mod) => {
                  let res = true;
                  // si validationplugin existe
                  for (let i = 0; i < mod.length; i++) {
                    const element = mod[i];
                    console.log(element);
                    console.log(element._server_id);
                    console.log(theme._server_id);
                    if (element._server_id == theme._server_id)
                      res = false;
                  }
                  if (res)
                    mod.push(theme);
                  // mod.push(theme);
                });
              } else {

                m.add_attr({
                  validationPlugin: new Ptr(new Lst())
                });
                m.validationPlugin.load((mod) => {
                  // si validationplugin existe 
                  mod.push(theme);
                });
              }

            }
          }, function () {
            console.log("model unreachable");
          });


        };
        // spinalModelDictionary.init().then((m) => {
        //   console.log("spinal model dictionary");
        //   if (m) {
        //     console.log(m);
        //     console.log(m.groupAlertPlugin);
        //     if (m.groupAlertPlugin) {
        //       m.groupAlertPlugin.load((mod) => {
        //         console.log("ON CHARGE LES DONNEE PRESENTE DANS GROUPE ANNOTATION PLUGIN");
        //         $scope.selectGroup = mod;
        //         $scope.selectGroup.bind($scope.onModelChange);
        //       });
        //     } else {
        //       console.log("delete of groupe annotation plugin");
        //       $scope.selectGroup = new Lst();
        //       m.add_attr({
        //         groupAlertPlugin: new Ptr($scope.selectGroup)
        //       });
        //       $scope.selectGroup.bind($scope.onModelChange);
        //     }
        //   }
        // }, function () {
        //   console.log("model unreachable");
        // });




        $scope.selectedNote = null;


        $scope.getViewIcon = (note) => {

          return note.display ? "fa-eye-slash" : "fa-eye";
        };



        $scope.pickGroup = (element) => {
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

        $scope.renameGroup = (note) => {
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

        $scope.viewAllObject = (selectGroup) => {

          allObjectService.hideShowPanel(selectGroup);
        };

        $scope.addAlertInGroup = (selectGroup) => {
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
              let mod = FileSystem._objects[selectGroup._server_id];
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

        $scope.deleteGroup = (selectGroup, note = null) => {
          console.log(note);
          var dialog = $mdDialog.confirm()
            .ok("Delete !")
            .title('Do you want to remove it?')
            .cancel('Cancel')
            .clickOutsideToClose(true);

          $mdDialog.show(dialog)
            .then((result) => {

              if (note != null) {
                for (var i = 0; i < $scope.selectGroup.length; i++) {
                  var allGroup = $scope.selectGroup[i];
                  if (allGroup._server_id == selectGroup._server_id) {
                    for (var j = 0; j < allGroup.group.length; j++) {
                      var annotation = allGroup.group[j];

                      if (annotation._server_id == note._server_id) {
                        $scope.selectGroup[i].group.splice(j, 1);
                        break;
                      }
                    }
                    break;
                  }
                }
              } else {
                for (var _i = 0; _i < $scope.selectGroup.length; _i++) {
                  var _allGroup = $scope.selectGroup[_i];
                  if (_allGroup._server_id == selectGroup._server_id) {
                    $scope.selectGroup.splice(_i, 1);
                    break;
                  }
                }
              }



            }, () => {})
        };



        // $scope.addItemInReferencial = (note) => {

        //   var items = viewer.getSelection();
        //   console.log("addItemInReferencial");
        //   console.log("items");
        //   if (items.length == 0) {
        //     alert('No model selected !');
        //     return;
        //   }

        //   viewer.model.getBulkProperties(items, {
        //     propFilter: ['name']
        //   }, (models) => {
        //     let mod = FileSystem._objects[note._server_id];
        //     console.log("ici est l'éxecution de additem in referencial")
        //     console.log(mod);
        //     console.log(models);
        //     console.log($scope.tree);


        //     let valide = true;
        //     if (mod) {
        //       for (var i = 0; i < models.length; i++) {
        //         for (let j = 0; j < mod.allObject.length; j++) {
        //           if (mod.allObject[j].dbId.get() == models[i].dbId)
        //             valide = false;
        //         }
        //         if (valide) {
        //           $scope.tree.enumNodeChildren(models[0].dbId, (child) => {
        //             if ($scope.tree.getChildCount(child) == 0) {
        //               var newBimObject = new bimObject();
        //               newBimObject.dbId.set(child);
        //               newBimObject.name.set(viewer.model.getData().instanceTree.getNodeName(child));
        //               newBimObject.group.set(0);
        //               mod.allObject.push(newBimObject);
        //             }
        //           }, true);
        //         }
        //         valide = true;
        //       }

        //       var toast = $mdToast.simple()
        //         .content("Item added !")
        //         .action('OK')
        //         .highlightAction(true)
        //         .hideDelay(0)
        //         .position('bottom right')
        //         .parent("body");

        //       $mdToast.show(toast);

        //     }

        //   })

        // }







        $scope.commentNote = (selectGroup) => {
          // messagePanelService.hideShowPanel(selectGroup);
        };

        $scope.sendFile = (selectGroup) => {
          // FilePanelService.hideShowPanel(selectGroup);
        }



        $scope.changeItemColor = (alert) => {
          console.log("changeItemColor");
          let dbIdList = [];
          for (let i = 0; i < alert.allObject.length; i++) {
            // const bimObject = alert.allObject[i];
            // dbIdList.push(bimObject.dbId.get());
            alert.display.set(true);
          }
          // viewer.setColorMaterial(dbIdList, alert.color.get(), alert._server_id);
        };


        $scope.restoreColor = (alert) => {
          console.log("restore color");
          let dbIdList = [];
          for (let i = 0; i < alert.allObject.length; i++) {
            // const bimObject = alert.allObject[i];
            // dbIdList.push(bimObject.dbId.get());
            alert.display.set(false);
          }
          // viewer.restoreColorMaterial(dbIdList, alert._server_id);
        };


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

        $scope.createRapport = (theme) => {
          

  /*-------------------------------------------A Modifier ------------------------------------------------*/
          var data = {
            datasets: [{
              data: [],
              backgroundColor: [],
              borderWidth: 0,
            }],
            labels: [],
          }

          for (let i = 0; i < theme.referencial.allObject.length; i++) {
            const element = theme.referencial.allObject[i];
            if (element.group.get() == 0)
              tmp++;
          }
          
          // console.log(tmp);
          data.datasets[0].data.push(tmp);
          data.labels.push(theme.referencial.name.get());
          data.datasets[0].backgroundColor.push(theme.referencial.color.get());

          // let percent;
          for (let i = 0; i < theme.group.length; i++) {
            data.datasets[0].data.push(theme.group[i].allObject.length);
            data.labels.push(theme.group[i].name.get());
            data.datasets[0].backgroundColor.push(theme.group[i].color.get());
          }



  /*-------------------------------------------Fin A Modifier ------------------------------------------------*/


          var body = document.getElementsByTagName("body")[0];
          body.innerHTML += ($templateCache.get('pdfTemplate.html'));

          
          var graph = document.getElementById("pdfGraph").getContext('2d');

          var myChart = new Chart(graph, {
            type : "doughnut",
            data : data,
            options: {
              legend: {
                position: "top",
                labels: {
                  fontColor: "#000000"//"#F8F8F8"
                }
              },
              responsive: true,
              animation: {
                duration: 0
              }
            }
          })

          var detail = document.getElementById("pdfGraphDetail");
          console.log(detail)

          for (var i = 0; i < theme.group.length; i++) {
            var alert = theme.group[i]
            
            var div = document.createElement("div");
            div.className = alert.id
            
            var title = document.createElement("h4");
            title.className = "pdfTitle";
            title.innerText = "  " + alert.name;
            title.style.display = "inline";

            var span = document.createElement('div');
            span.style.width = "100px";
            span.style.height = "10px";
            span.style.border = "1px solid black";
            span.style.background = alert.color;
            span.style.display = "inline-block";

            var titleDiv = document.createElement('div');

            titleDiv.appendChild(span);
            titleDiv.appendChild(title);
            // titleDiv.appendChild(document.createElement("hr"));

            titleDiv.style.padding = "10px";
            title.style.color = "#ffffff";
            title.style.height = "30px";

            titleDiv.style.background = "#3A3A3A"

            var ol = document.createElement("ol");
            var li;

            for (var j = 0; j < alert.allObject.length; j++) {
              var item = alert.allObject[j]

              li = document.createElement('li');
              li.innerText = item.dbId + " - " + item.name;
              ol.appendChild(li);              
            }

            div.appendChild(titleDiv);
            div.appendChild(ol); 
            detail.appendChild(div);

          }

      
          html2canvas(document.getElementById("myPdfTemplate"),{
            // width: 730, 
            // height: 1050,
            onrendered: function(canvas){
              var imgData = canvas.toDataURL('image/jpeg');
              var doc = new jsPDF({unit : "px",format : "a4"});
              doc.addImage(imgData,'jpeg',0,10);
              doc.save('test.pdf');
              // doc.output("dataurlnewwindow");
            }
          })


          
          

        }

        

      }
      // end of controller
    ]);
})();