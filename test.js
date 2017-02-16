const ss = require("./index.js");

var data = new ss.Jar ('testJar.json', (objects) => {
  console.log(objects);
  data.data[0].name = "Anonymouse";
  console.log(data.data);
  data.save();
}, {name: 'Anonymous', age: 18}, {name: 'Anonymoso', age: 21});
