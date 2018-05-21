const ENTRY = 'BobDylan'

const https = require("https")
const fs = require("fs")
const inputFile = "./identifiers/identifiers_BobDylan.js"

let getRequests = 0
let identifiers
let SOURCES = []
let FROM = 0

// BobDylan items: 1853
//let TO =

fs.readFile(inputFile, function (err, data) {
  if (err) return console.log(err)

  identifiers = JSON.parse(data.toString())
  identifiers = identifiers.identifiers

  TO = identifiers.length - 1

  buildGdFromGdCollection(FROM, TO)
})

function buildGdFromGdCollection(start, end) {
	var resultsWithMp3 = [];

	(function buildResultsWithMp3(start, end) {
		//GET metadata of gdCollection array items from start index to end (inclusive)
		//then call a function that builds the necessary JSON and appends to Array gd
		for (var i = start; i <= end; i++) {
			if ( identifiers[i] != undefined)
				var uri = 'https://archive.org/metadata/' + identifiers[i]
			else {
				console.log('index not found. finished.');
				break;
			}

			function endsWithMp3(element) {
        return element.name.match(/\.mp3$/);
			}

			https.get(uri, function(res) {
				res.setEncoding("utf8");
				let body = "";

				res.on("data", data => {
					body += data;
				});

				res.on("end", () => {
					body = JSON.parse(body);

					if (body.files != undefined && body.files.some(endsWithMp3)) {
						resultsWithMp3.push(body);
					} else {
            console.log('no mp3s! not exiting. index: ', i);
          }

					if ( ++getRequests == end - start ) {

            console.log('about to handle. index: ', i);
						handleResultsWithMp3();
						//setTimeout(getMetadata(end + 1, end + 31), 0);
					}

				})

			}) //HTTPS.GET

		}

  })(start, end);

 	function handleResultsWithMp3() {
    var counter = resultsWithMp3.length;
	 	resultsWithMp3.forEach(addSourceToSOURCES);

	 	function addSourceToSOURCES(element, index, array) {
	 		try {
	 			if (element.metadata && element.metadata.date) {
	 				let dateStr = element.metadata.date;
	 				let date,
	 					day,
	 					dir,
	 					month,
	 					server,
	 					subject,
	 					title,
	 					venue,
	 					year;

	 				const dateStrMatches = dateStr.match(/(\d{2,4})-(\d{1,2})-(\d{1,2})/);

	 				if(dateStrMatches) {
	 					//set year
	 					if (dateStrMatches[1].length == 2)
	 						year = '19' + dateStrMatches[1];
	 					else if (dateStrMatches[1].length == 4)
	 						year = dateStrMatches[1];
	 					else
	 						throw 'weird dateStr:' + dateStr;

	 					//set month
	 					if (dateStrMatches[2].length == 1)
	 						month = '0' + dateStrMatches[2];
	 					else if (dateStrMatches[2].length == 2)
	 						month = dateStrMatches[2];
	 					else
	 						throw 'weird dateStr:' + dateStr;

	 					//set day
	 					if (dateStrMatches[3].length == 1)
	 						day = '0' + dateStrMatches[3];
	 					else if (dateStrMatches[3].length == 2)
	 						day = dateStrMatches[3];
	 					else
	 						throw 'weird dateStr:' + dateStr;

	 					//set date
	 					date = new Date(`<${year}-${month}-${day}>`);
	 				}

	 				else throw 'weird dateStri:' + dateStr;


	 				//get mp3s from source
	 				let tracks = element.files.filter(file => file.name.slice(-4) === '.mp3' );

	 				//build array of track objects
	 				let tracksObjs = tracks.map(function(track, index, array) {
	 					return {
	 						duration: track.length,
	 						title: track.title,
	 						track: track.track,
	 						uri: track.name,
	 					};
	 				});

	 				//build source obj
	 				let sourceObj = {
	 					date: date,
	 					dir: element.dir || undefined,
	 					tracks: tracksObjs,
	 					server: element.server || undefined,
	 					subject: element.metadata.subject || undefined,
	 					title: element.metadata.title || undefined,
	 					venue: element.metadata.venue || undefined,
	 				};

	 				//push source
	 				SOURCES.push(sourceObj);

	 				if (--counter == 0) {
	 					console.log('bout 2 do');
	 					//insertGdIntoDB();
	 				}
	 			}

	 			else throw 'no date ... or no metadata';

	 		}
	 		catch (e) {
	 			console.log(e);
	 		}

		};
	}
 }



// function insertGdIntoDB() {
// 	console.log('dbing');
// 	var MongoClient = require('mongodb').MongoClient;
//
// 	var db_uri = "";
// 	MongoClient.connect(db_uri, function(err, db) {
// 	  db.collection('sources').insertMany(gd)
// 		.then(function(result) {
// 			console.log(result);
// 		});
//
// 	  db.close();
// 	});
// }
