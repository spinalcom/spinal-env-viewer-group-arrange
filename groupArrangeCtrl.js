import 'html2canvas'
import * as jspdf from 'jspdf'

(function () {
  angular.module('app.spinalforge.plugin')
    .controller('groupArrangeCtrl', ["$scope", "$rootScope", "$mdToast", "$mdDialog", "authService", "$compile", "$injector", "layout_uid", "spinalModelDictionary", "$q", "groupPanelService", "allObjectService", "createPanelService", "donutService", "$templateCache",
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
          // console.log("headerBtnClick");
          // console.log(btn);
          if (btn.label == "add group") {
            $scope.addGroup();
          }
        };

        $scope.headerBtn = [{
          label: "add group",
          icon: "note_add"
        }];
        $scope.currentVisibleObj = [];

        $scope.allGroup = [];
        spinalModelDictionary.init().then((m) => {
          // console.log("spinal model dictionary");
          if (m) {
            if (m.groupAlertPlugin) {
              m.groupAlertPlugin.load((mod) => {
                // console.log("ON CHARGE LES DONNEE PRESENTE DANS GROUPE ANNOTATION PLUGIN");
                $scope.selectGroup = mod;
                $scope.selectGroup.bind($scope.onModelChange);
              });
            } else {
              // console.log("delete of groupe annotation plugin");
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
                    if (selectedGroup.referencial.display.get())
                      viewer.setColorMaterial([refObject.dbId.get()], selectedGroup.referencial.color.get(), refObject._server_id);
                    else
                      viewer.restoreColorMaterial([refObject.dbId.get()], refObject._server_id);

                  } else {
                    for (let k = 0; k < selectedGroup.group.length; k++) {
                      const alert = selectedGroup.group[k];
                      if (refObject.group.get() == alert.id.get()) { // si l'objet est dans l'alert
                        if (alert.display.get()) { //si le display de l'alert est true
                          viewer.setColorMaterial([refObject.dbId.get()], alert.color.get(), refObject._server_id);
                        } else { // si le display de l'alert est false
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
            }
          }
        };


        $scope.donut = (groupArrange) => {

          donutService.hideShowPanel("donutCtrl", "donutTemplate.html", groupArrange);
        };


        // selection du menu deroulant
        $scope.selectedGroupFunc = () => {
          for (let i = 0; i < $scope.selectGroup.length; i++) {
            var element = $scope.selectGroup[i];
            // console.log($scope.selectedGroupId);
            if (element.id.get() == $scope.selectedGroupId) {
              // console.log("MYY IFFFFF");
              $scope.selectedGroup = element;
              // console.log($scope.selectedGroup);
              $scope.selectedGroupAlarm = element.group;
            }
          }
        };


        $scope.addGroup = () => {
          $mdDialog.show($mdDialog.prompt()
              .title("add Group")
              .placeholder('Please enter the Name')
              .ariaLabel('Add Theme')
              .clickOutsideToClose(true)
              .required(true)
              .ok('Confirm').cancel('Cancel'))
            .then(function (result) {

              var newGroup = new groupModel(result);
              newGroup.owner.set($scope.user.id);

              newGroup.id.set($scope.selectGroup.length);
              $scope.selectGroup.push(newGroup);

            }, () => {});
        };


        $scope.export = (theme) => {

          spinalModelDictionary.init().then((m) => {
            if (m) {
              // console.log(m);
              if (m.validationPlugin) {
                m.validationPlugin.load((mod) => {
                  let res = true;
                  // si validationplugin existe
                  for (let i = 0; i < mod.length; i++) {
                    const element = mod[i];
                    if (element._server_id == theme._server_id)
                      res = false;
                  }

                  let present = true;
                  let nonPresent = true;
                  let rempli = true;


                  for (let i = 0; i < theme.group.length; i++) {
                    const group = theme.group[i];
                    if (group.name.get() == "Présent")
                      present = false;
                    if (group.name.get() == "Non présent")
                      nonPresent = false;
                    if (group.name.get() == "Non rempli")
                      rempli = false;
                  }
                  if (present) {
                    let alert = new groupAlert("Présent", "#57D53B");
                    alert.id.set(theme.group.length + 1);
                    console.log(alert);
                    theme.group.push(alert)
                  }
                  if (rempli) {
                    let alert = new groupAlert("Non rempli", "#FA6203");
                    alert.id.set(theme.group.length + 1);
                    console.log(alert);
                    theme.group.push(alert)
                  }
                  if (nonPresent) {
                    let alert = new groupAlert("Non présent", "#F20909");
                    alert.id.set(theme.group.length + 1);
                    theme.group.push(alert);
                    console.log(alert);
                  }

                  if (res) {
                    mod.push(theme);
                  }
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


        $scope.selectedNote = null;


        $scope.getViewIcon = (note) => {

          return note.display ? "fa-eye-slash" : "fa-eye";
        };



        $scope.pickGroup = (element) => {
          $scope.selectedGroup = element;
          createPanelService.hideShowPanel("groupAlertCtrl", "selectedGroupTemplate.html", element);

        };

        $scope.selectAlarm = (element) => {
          $scope.selectedAlarm = element;
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

              // console.log(mod);

              if (mod) {
                if (mod.title)
                  mod.title.set(result);
                else {
                  mod.name.set(result);
                }
              }
            }, () => {});
        };

        $scope.viewRemoveAllAlert = () => {
          spinalModelDictionary.init().then((m) => {
            // console.log("spinal model dictionary");
            if (m) {
              if (m.groupAlertPlugin) {
                m.groupAlertPlugin.load((mod) => {
                  // console.log("ON CHARGE LES DONNEE PRESENTE DANS GROUPE ANNOTATION PLUGIN");
                  console.log(mod);
                  for (let i = 0; i < mod.length; i++) {
                    const theme = mod[i];
                    theme.referencial.display.set(false);
                  }
                });
              }
            }
          }, function () {
            console.log("model unreachable");
          });
        };

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
              var annotation = new groupAlert();
              annotation.name.set(result);

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
          // console.log(note);
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



        $scope.changeItemColor = (alert) => {
          let dbIdList = [];
          for (let i = 0; i < alert.allObject.length; i++) {
            alert.display.set(true);
          }
        };


        $scope.restoreColor = (alert) => {
          // console.log("restore color");
          let dbIdList = [];
          for (let i = 0; i < alert.allObject.length; i++) {
            alert.display.set(false);
          }
        };


        function create_group_Rapport(detail, alert, name) {
          let is_ref = false;
          if (!name) {
            name = alert.name;
          } else
            is_ref = true;
          var div = document.createElement("div");
          div.className = alert.id;

          var title = document.createElement("h4");
          title.className = "pdfTitle";
          title.innerText = "  " + name;

          var span = document.createElement('div');
          span.className = "color_span"
          span.style.background = alert.color;

          var titleDiv = document.createElement('div');
          titleDiv.className = "titleDiv"
          titleDiv.appendChild(span);
          titleDiv.appendChild(title);
          // titleDiv.appendChild(document.createElement("hr"));
          title.className = "__title"

          div.appendChild(titleDiv);
          var ol = document.createElement("ul");
          var li;
          let empty = true;
          if (alert.allObject.length > 0) {
            for (var j = 0; j < alert.allObject.length; j++) {
              var item = alert.allObject[j]
              if (!is_ref || (is_ref && item.group.get() == 0)) {
                empty = false;
                li = document.createElement('li');
                li.innerText = item.dbId + " - " + item.name;
                ol.appendChild(li);
              }
            }
          }
          if (empty) {
            li = document.createElement('li');
            li.innerText = "Groupe Vide.";
            ol.appendChild(li);

          }
          div.appendChild(ol);
          detail.appendChild(div);
        }

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
          let tmp = 0;
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

          var printWindow = window.open('', '', 'height=400,width=900');
          printWindow.document.write('<html><head><title>Rapport SpinalBIM - ' + theme.name + '</title>');
          printWindow.document.write('</head><body >');
          // printWindow.document.write(divContents);
          printWindow.document.write($templateCache.get('pdfTemplate.html'));
          printWindow.document.write('</body></html>');


          // var body = document.getElementsByTagName("body")[0];
          // body.innerHTML += ($templateCache.get('pdfTemplate.html'));


          var graph = printWindow.document.getElementById("pdfGraph").getContext('2d');

          var myChart = new Chart(graph, {
            type: "doughnut",
            data: data,
            options: {
              legend: {
                position: "top",
                labels: {
                  fontColor: "#000000" //"#F8F8F8"
                }
              },
              responsive: true,
              animation: {
                duration: 0
              }
            }
          })

          var detail = printWindow.document.getElementById("pdfGraphDetail");
          console.log(detail)

          for (var i = 0; i < theme.group.length; i++) {
            var alert = theme.group[i]
            create_group_Rapport(detail, alert);
          }

          create_group_Rapport(detail, theme.referencial, "Non classifié");

          let _title = printWindow.document.querySelector(".title > ._answer");
          _title.innerHTML = theme.name.get();

          let date_now = new Date();
          let _date = printWindow.document.querySelector(".date > ._answer");
          _date.innerHTML = date_now.toLocaleDateString("en-GB");

          let _username = printWindow.document.querySelector(".username > ._answer");
          _username.innerHTML = $scope.user.username;


          // html2canvas(document.getElementById("myPdfTemplate"), {
          //   // width: 730, 
          //   // height: 1050,
          //   onrendered: function (canvas) {
          //     var imgData = canvas.toDataURL('image/jpeg');
          //     var doc = new jsPDF({
          //       unit: "px",
          //       format: "a4"
          //     });
          //     doc.addImage(imgData, 'jpeg', 0, 10);
          //     doc.save('test.pdf');
          //     // doc.output("dataurlnewwindow");
          //   }
          // })
          setTimeout(() => {
            let quotes = printWindow.document.getElementById("myPdfTemplate")
            html2canvas(quotes).then(function (canvas) {
              var imgData = canvas.toDataURL('image/jpeg');
              // console.log(jsPDF);
              var doc = new jspdf.default("p", "mm", "a4");
              // var doc = new jspdf.default({
              //   unit: "px",
              //   format: "a4"
              // });
              let canvasList = [];
              // console.log(quotes.clientHeight);

              doc.addImage(imgData, 'jpeg', 0, 10);
              doc.save('Rapport SpinalBIM - ' + theme.name.get() + ' - ' +
                date_now.toLocaleDateString("en-GB") + '.pdf');

              setTimeout(() => {
                // quotes.remove();
                // for (var i = 0; i < canvasList.length; i++) {
                //   canvasList[i].remove();
                // }
              }, 200);
              // printWindow.close();

            })
          }, 200);
        }
      }
      // end of controller
    ]);
})();