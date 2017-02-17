/*
SimpleStore Persistent Backwards-compatible JavaScript Object Storage
Copyright (C) 2017  Damian Heaton <dh64784@gmail.com> (damianheaton.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

const fs = require("fs");

class Jar { // who stole the cookies from the cookie jar? it isn't a cookie...
  constructor (file, callback, ...defaultObjects) { // let infinite objects be saved in one file :) it makes things super-sweet
    this.file = file;
    this.data = defaultObjects; // set the data to be the default objects provided
    var that = this;
    fs.readFile(file, 'utf-8', (err, data) => {
      if (!err) { // yay
        var json = JSON.parse (data); // first we need to parse the JSON file
        for (var cookie in json) { // what? I want a cookie.
          // backwards-compatibility is absolutely key. to that end, we need to cycle each property of the cookie and update the Jar's cookie. that way, we don't remove new properties from a cookie. (any good dev would not remove a cookie entirely between versions... but we'll account for them)

          if (that.data[cookie] !== undefined) { // if the dev removed a cookie from a Jar, that cookie should now be undefined... so DON'T TRY AND ASSIGN TO IT [it's dead, Jim, and we ain't resuscitating it]
            for (var crumb in json[cookie]) {
              that.data[cookie][crumb] = json[cookie][crumb]; // update the loaded cookie
            }
          }
        }
        callback (that.data);
      } else {
        // woops, didn't work!
        if (err.code !== 'ENOENT') // if the error is a nonexistant file, that's fine. there's just no data to load :>
          throw err; // otherwise, we need to throw this one back to the dev.
      }
    });
  }

  save (callback=null, spaces=2) {
    var json = JSON.stringify (this.data, null, spaces);
    var that = this;
    if (typeof callback === 'number') {
      spaces = callback;
      callback = null;
    }
    fs.writeFile (this.file, json, 'utf-8', (err) => {
      if (err) throw err;
      if (typeof callback === 'function')
        callback (that.data);
    });
  }
}

class JarSync { // synchronous variant to Jar
  constructor (file, ...defaultObjects) { // let infinite objects be saved in one file :) it makes things super-sweet
    this.file = file;
    this.data = defaultObjects; // set the data to be the default objects provided
    var that = this;
    try{
      var data = fs.readFileSync(file, 'utf-8');
    } catch (err) {
      // woops, didn't work!
      if (err.code !== 'ENOENT') // if the error is a nonexistant file, that's fine. there's just no data to load :>
        throw err; // otherwise, we need to throw this one back to the dev.
    }
    var json = JSON.parse (data); // first we need to parse the JSON file
    for (var cookie in json) { // what? I want a cookie.
      // backwards-compatibility is absolutely key. to that end, we need to cycle each property of the cookie and update the Jar's cookie. that way, we don't remove new properties from a cookie. (any good dev would not remove a cookie entirely between versions... but we'll account for them)

      if (that.data[cookie] !== undefined) { // if the dev removed a cookie from a Jar, that cookie should now be undefined... so DON'T TRY AND ASSIGN TO IT [it's dead, Jim, and we ain't resuscitating it]
        for (var crumb in json[cookie]) {
          that.data[cookie][crumb] = json[cookie][crumb]; // update the loaded cookie
        }
      }
    }

    return this.data;
  }

  save (spaces=2) {
    var json = JSON.stringify (this.data, null, spaces);
    fs.writeFileSync (this.file, json, 'utf-8');
    return this.data;
  }
}

exports.Jar = Jar;
exports.JarSync = JarSync;
