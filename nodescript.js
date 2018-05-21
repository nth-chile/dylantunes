var fs    = require("fs"),
    inputFile = "./small.txt",
    regex = /archive.org\/serve\/(.*?)\//g

fs.readFile(inputFile, function (err, data) {
  if (err) return console.log(err);

  var fileContents = data.toString('utf8');
  // getAllMatches(regex, )
});

// example: /archive.org\/serve\/(.*?)\//g
// must have g flag or infinite loop
function getAllMatches(regex, string) {
  var matches, output = [];

  while (matches = regex.exec(input)) {
      output.push(matches[1]);
  }

  return output;
}

function output(thing) {
  fs.writeFile(`inputFile`, thing, function(err) {
      if(err) return console.log(err);

      console.log("The file was saved!");
  });
}
