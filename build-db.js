const https = require("https");

var gd = [];
var getRequests = 0;

buildGdFromGdCollection(11460, 11466);

function buildGdFromGdCollection(start, end) {

	//var gdCollection ..

	var resultsWithMp3 = [];

	(function buildResultsWithMp3(start, end) {
		//GET metadata of gdCollection array items from start index to end (inclusive)
		//then call a function that builds the necessary JSON and appends to gd
		for (var i = start; i <= end; i++) {

			if ( gdCollection.response.docs[i] != undefined)
				var uri = 'https://archive.org/metadata/' + gdCollection.response.docs[i].identifier;
			else {
				console.log('index not found. finished.');
				break;
			}

			function endsWithMp3(element, index, array) {
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
					}
					if ( ++getRequests == end - start ) {
						handleResultsWithMp3();
						//setTimeout(getMetadata(end + 1, end + 31), 0);
					}

				});

			}); //HTTPS.GET

		}
 	})(start, end);

 	function handleResultsWithMp3() {

	 	function addSourceToGd(element, index, array) {
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

	 				else throw 'weird dateStr:' + dateStr;


	 				//	OLD y.m.d FORMAT
	 				// //add date to obj if new
	 				// if (gd[year] == undefined) 				gd[year] = {};
	 				// if (gd[year][month] == undefined) 		gd[year][month] = {};
	 				// if (gd[year][month][day] == undefined)  gd[year][month][day] = [];

	 				//build source obj
	 				if (element.dir != undefined)
	 					dir = element.dir;
	 				else
	 					throw 'weird dir';
	 				if (element.server != undefined)
	 					server = element.server;
	 				else
	 					throw 'weird server';
	 				if (element.metadata.subject != undefined)
	 					subject = element.metadata.subject;
	 				else {
	 					console.log('weird subject: ', element.metadata );
	 					subject: undefined;
	 				}
	 				if (element.metadata.title != undefined)
	 					title = element.metadata.title;
	 				else
	 					throw 'weird title';
	 				if (element.metadata.venue != undefined)
	 					venue = element.metadata.venue;
	 				else {
	 					console.log('weird venue: ', element.metadata );
	 					venue: undefined;
	 				}

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
	 					dir: dir,
	 					tracks: tracksObjs,
	 					server: server,
	 					subject: subject,
	 					title: title,
	 					venue: venue,
	 				};

	 				//push source
	 				gd.push(sourceObj);
	 				console.log(counter);
	 				if (--counter == 0) {
	 					console.log('bout 2 do');
	 					insertGdIntoDB();
	 				}

	 				// OLD y.m.d FORMAT
	 				// gd[year][month][day].push(sourceObj);

	 			}

	 			else throw 'no date ... or no metadata';

	 		}
	 		catch (e) {
	 			console.log(e);
	 		}

		};

		var counter = resultsWithMp3.length;
	 	resultsWithMp3.forEach(addSourceToGd);

	}
 }



function insertGdIntoDB() {
	console.log('dbing');
	var MongoClient = require('mongodb').MongoClient;

	var db_uri = "mongodb://nth-chile:yerbamate1@ds115045.mlab.com:15045/grateful-dead";
	MongoClient.connect(db_uri, function(err, db) {
	  db.collection('sources').insertMany(gd)
		.then(function(result) {
			console.log(result);
		});

	  db.close();
	});
}
