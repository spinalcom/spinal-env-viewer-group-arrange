angular.module('app.spinalforge.plugin')
  .factory('groupFactory', ["$rootScope", "$compile", "$templateCache", "$http",
    function ($rootScope, $compile, $templateCache, $http) {
      let load_template = (uri, name) => {
        $http.get(uri).then((response) => {
          $templateCache.put(name, response.data);
        }, (errorResponse) => {
          console.log('Cannot load the file ' + uri);
        });
      };
      let toload = [{
        uri: '../templates/spinal-env-viewer-group-arrange/selectedGroupTemplate.html',
        name: 'selectedGroupTemplate.html'
      },
      {
        uri: '../templates/spinal-env-viewer-group-arrange/pdfTemplate.html',
        name: 'pdfTemplate.html'
      }];
      for (var i = 0; i < toload.length; i++) {
        load_template(toload[i].uri, toload[i].name);
      }

      this.panel = new PanelClass(v, "message Panel");
      this.panel.container.style.right = "0px";
      this.panel.container.style.width = "400px";
      this.panel.container.style.height = "600px";
      this.panel.container.style.minHeight = "100px";
      this.panel.container.style.minwidth = "200px";
      this.panel.container.padding = "0px";

      var _container = document.createElement('div');
      _container.style.height = "calc(100% - 45px)";
      _container.style.overflowY = 'auto';
      this.panel.container.appendChild(_container);

      // $(_container).html("<div ng-controller=\"commentCtrl\" ng-cloak>" +
      //   $templateCache.get("commentTemplate.html") + "</div>");
      // $compile($(_container).contents())($rootScope);
      var init = false;
      return {
        getPanel: () => {

          if (init == false) {
            init = true;
            $(_container).html("<div ng-controller=\"groupArrangeCtrl\" class=\"panelContent\" ng-cloak>" +
              $templateCache.get("selectedGroupTemplate.html") + "</div>");
            $compile($(_container).contents())($rootScope);
          }

          return this.panel;
        }
      };

    }
  ]);

angular.module('app.spinalforge.plugin')
  .factory('groupPanelService', ["$rootScope", "$compile", "$templateCache", "$http", "groupFactory",
    function ($rootScope, $compile, $templateCache, $http, groupFactory) {

      var currentNote;
      var init = false;
      var myCallback = null;

      return {

        hideShowPanel: (note) => {
          if (init == false) {
            init = true;
            this.panel = groupFactory.getPanel();
          }

          if (!this.panel.isVisible()) {
            currentNote = note;
            this.panel.setVisible(true);
            this.panel.setTitle(note.name);
          } else if (this.panel.isVisible() && note._server_id == currentNote._server_id) {
            this.panel.setVisible(false);
          } else {
            currentNote = note;
            this.panel.setTitle(note.name);
          }

          if (myCallback)
            myCallback(currentNote);
        },

        register: (callback) => {
          myCallback = callback;
          callback(currentNote);
        }

      };

    }
  ]);



// angular.module('app.spinalforge.plugin')
//   .factory('groupFactory', ["$rootScope", "$compile", "$templateCache", "$http",
//     function ($rootScope, $compile, $templateCache, $http) {
//       let load_template = (uri, name) => {
//         return $http.get(uri).then((response) => {
//           $templateCache.put(name, response.data);
//         }, (errorResponse) => {
//           console.log('Cannot load the file ' + uri);
//         });
//       };
//       let toload = [{
//         uri: '../templates/spinal-env-viewer-annotation-group-pannel/fileTemplate.html',
//         name: 'fileTemplate.html'
//       }];
//       for (var i = 0; i < toload.length; i++) {
//         load_template(toload[i].uri, toload[i].name);
//       }

//       var tabPanel = {};
//       //   {
//       //     [panelGroupName] : {
//       //       uri:"",
//       //       shortcutHTML:"",
//       //       controllerName:"",
//       //       panel: null
//       //   }
//       // }


//       var createPanel = (panelGroupName) => {
//         var currentPannel = tabPanel[panelGroupName]
//         if (!currentPannel.panel) {

//           currentPannel.panel = new PanelClass(v, "message Panel");
//           currentPannel.panel.container.style.right = "0px";
//           currentPannel.panel.container.style.width = "400px";
//           currentPannel.panel.container.style.height = "600px";
//           currentPannel.panel.container.padding = "0px";

//           var _container = document.createElement('div');
//           _container.style.height = "calc(100% - 45px)";
//           _container.style.overflowY = 'auto';
//           currentPannel.panel.container.appendChild(_container);

//         }
//         return currentPannel.panel

//       }

//       var addTemplate = (uri, name, controllerName, panelGroupName) => {
//         var currentPannel = tabPanel[panelGroupName]
//         if (!currentPannel) {
//           tabPanel[panelGroupName] = {
//             uri: uri,
//             shortcutHTML: name,
//             controllerName: controllerName,
//             panel: null
//           }
//           load_template(uri, name).then(() => {
//             createPanel(panelGroupName);
//             $(_container).html("<div ng-controller=\"" + currentPanel.controllerName + "\" class=\"panelContent\" ng-cloak>" +
//               $templateCache.get(currentPanel.shortcutHTML) + "</div>");
//             $compile($(_container).contents())($rootScope);

//           })

//         }



//       };

//       // this.panel = new PanelClass(v, "message Panel");
//       // this.panel.container.style.right = "0px";
//       // this.panel.container.style.width = "400px";
//       // this.panel.container.style.height = "600px";
//       // this.panel.container.padding = "0px";

//       // var _container = document.createElement('div');
//       // _container.style.height = "calc(100% - 45px)";
//       // _container.style.overflowY = 'auto';
//       // this.panel.container.appendChild(_container);

//       // var init = false;



//       return {
//         addTemplate: addTemplate,
//         getPanel: (panelGroupName) => {
//           var currentPannel = tabPanel[panelGroupName]
//           return currentPannel;
//         }
//       };

//     }
//   ]);