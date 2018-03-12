// Copyright 2015 SpinalCom  www.spinalcom.com

// This file is part of SpinalCore.

// SpinalCore is free software: you can redistribute it and/or modify
// it under the terms of the GNU Lesser General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Soda is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Lesser General Public License for more details.
// You should have received a copy of the GNU General Public License
// along with Soda. If not, see <http://www.gnu.org/licenses/>.


var exports = module.exports = {};


var groupModel = class groupModel extends Model {
  constructor(name = "group Alert") {
    super();

    this.add_attr({
      id: 0,
      name: name,
      type: "",
      display: true,
      username: '',
      owner: '',
      create: Date.now(),
      allObject: [],
      group: [],
    });
    this.add_attr({
      referencial: this.addReferencial("referencial")
    });
  }
  addReferencial(name, color = '#008000') {
    var my_groupAlert = new groupAlert(name, color, this.allObject);
    return (my_groupAlert);
  }
};
exports.groupModel = groupModel;


var groupAlert = class groupAlert extends Model {
  constructor(name = "Alert", color = '#008000', allObject = []) {
    super();

    this.add_attr({
      id: 0,
      name: name,
      display: true,
      color: color,
      allObject: allObject,
    });
  }
};
exports.groupAlert = groupAlert;

var bimObject = class bimObject extends Model {
  constructor(name = "group") {
    super();
    var timeserie = new endpoint_TimeSeries();
    this.add_attr({
      dbid: 0,
      name: '',
      on_off: true,
      group: 0,
      properties: [],
      timeSeries: new Ptr(timeserie)
    });
  }
};
exports.bimObject = bimObject;