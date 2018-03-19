angular.module('app.spinalforge.plugin')
  .factory('donutFactory', ["$rootScope", "$compile", "$templateCache", "$http",
    function ($rootScope, $compile, $templateCache, $http) {

      let load_template = (uri, name) => {
        $http.get(uri).then((response) => {
          $templateCache.put(name, response.data);
        }, (errorResponse) => {
          console.log('Cannot load the file ' + uri);
        });
      };
      let toload = [{
        uri: '../templates/spinal-env-viewer-group-arrange/donutTemplate.html',
        name: 'donutTemplate.html'
      }];
      for (var i = 0; i < toload.length; i++) {
        load_template(toload[i].uri, toload[i].name);
      }

      var objectSelected = null;
      return {
        // addTemplate: (uri, name) => {
        //   load_template(uri, name);
        // },



        createPanel: (controllerName, templateName, _objectSelected) => {
          objectSelected = _objectSelected;
          this.panel = new PanelClass(v, "create panel");
          this.panel.container.style.top = "72%";
          this.panel.container.style.minWidth = "200px";
          this.panel.container.style.width = "fit-content";
          this.panel.container.style.minHeight = "200px";
          this.panel.container.style.maxWidth = "200px";

          this.panel.container.padding = "0px";

          var _container = document.createElement('div');
          _container.style.height = "calc(100% - 45px)";
          _container.style.overflowY = 'auto';
          this.panel.container.appendChild(_container);


          $(_container).html("<div ng-controller=\"" + controllerName + "\" class=\"panelContent\" ng-cloak>" +
            $templateCache.get(templateName) + "</div>");
          $compile($(_container).contents())($rootScope);
          this.panel.setVisible(true);
          this.panel.setTitle(_objectSelected.name);
          return this.panel;
        },
        getSelected: () => {
          return objectSelected;
        },

      };
    }
  ]);

angular.module('app.spinalforge.plugin')
  .factory('donutService', ["$rootScope", "$compile", "$templateCache", "$http", "donutFactory",
    function ($rootScope, $compile, $templateCache, $http, donutFactory) {

      var currentNote;
      var init = false;
      var myCallback = null;
      let tab = [];
      return {

        hideShowPanel: (controllerName, templateName, note) => {
          let currentPanel = donutFactory.createPanel(controllerName, templateName, note);
          // for (let i = 0; i < tab.length; i++) {
          //   if (tab[i] != note) {
          //     init = true;
          //   } else {
          //     currentPanel = tab[i];
          //     init = false;
          //   }
          // }
          // if (!currentPanel) {

          // }
          // if (currentPanel) {
          //   currentPanel.setVisible(false);
          //   this.panel.setTitle(note.name);
          // } else {





          // if (!this.panel.isVisible()) {
          //   currentNote = note;
          //   this.panel.setVisible(true);
          //   this.panel.setTitle(note.name);

          // } else {
          //   currentNote = note;
          //   this.panel.setTitle(note.name);
          // }

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