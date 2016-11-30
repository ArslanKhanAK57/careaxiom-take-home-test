

// to make http requests
var http = require('http');

// to parse urls inorder to get components a url is composed of (host, path etc...)
var url = require('url');

// to parse html
var cheerio = require('cheerio');

// create http server and start listening on port 8080
http.createServer(function(request, response){

	// parser request url and create urlObject
	var requestUrl = url.parse(request.url, true);

	// get route or path from request url
	var pathname = requestUrl.pathname;

	// check if request is coming from valid route
	if ( pathname.toLowerCase() == '/i/want/title/' ) {
		var start = new Date().getTime();
		response.writeHead(200, {"Content-Type": "text/html"});

		// extract query string parameters from request url
		var queryString = requestUrl.query;

		// check if parameter with name 'address' is passed in query string or not
   	    if (queryString.address) {
   	    	// get all parameters with name 'address' and create array in case of multiple
   	    	var addresses = queryString.address;

   	    	// if single parameter with name 'address' passed then create array
   	    	if ( !Array.isArray(addresses) ) {
   	    		addresses = [addresses];
   	    	}

   	    	var htmlResponse = '<html><head></head><body><h1> Following are the titles of given websites: </h1><ul>';

   	    	// callback function when request is completed either successful or non successful
   	    	var addTitleInResponse = function(addresses, index, websiteResonse) {

   	    		if ( websiteResonse ) {
			    	// load documet via cheerio
				  	$ = cheerio.load(websiteResonse);
				  	// append list item in response
				  	htmlResponse = htmlResponse + '<li> ' + addresses[index] + ' - "' + $('title').text() + '" </li>';
			    }
			    else {
			    	htmlResponse = htmlResponse + '<li> ' + addresses[index] + ' - NO RESPONSE </li>';
			    }

			  	// if not all addresses are request then request for next index available otherwise send response back as all addresses have been requested
			    if ( index < addresses.length - 1 ) {
			    	makeRequest(addresses, index+1, addTitleInResponse);
			    }
			    else {
			    	htmlResponse = htmlResponse + '</ul></body></html>';
			    	response.end(htmlResponse);
			    	console.log(new Date().getTime()-start);
		    	}
   	    	};

   	    	// receives websites address array and an index to request on address on specified index
   	    	function makeRequest(addresses, index, addTitleInResponse) {

   	    		var address = addresses[index];

   	    		// add protocol if address does not have already.
   	    		if ( !address.startsWith('https://') && !address.startsWith('http://') ) {
   	    			address = 'http://' + address;
   	    		}
   	    		var requestUrlObject = url.parse(address, true);

   	    		// create request options
				var requestOptions = {
				  host: requestUrlObject.hostname,
				  path: requestUrlObject.pathname
				};

				// request callback function
				requestCallback = function(websiteResonse) {
					// initialize object that will hold response from request
					var htmlDocument = '';
					
					// append data each time data is available
					websiteResonse.on('data', function (data) {
					    htmlDocument += data;
					});

					websiteResonse.on('end', function () {						
						addTitleInResponse(addresses, index, htmlDocument);					  					    
				    });
				}

				var httpRequest = http.request(requestOptions, requestCallback);

				// if error occures for any address then add error response and proceed with the next address available
				httpRequest.on('error', function(error) {
					addTitleInResponse(addresses, index);
				});
				httpRequest.end();
   	    	}

   	    	// start with first address available
   	    	makeRequest(addresses, 0, addTitleInResponse);
	    }
	    else {
	    	response.end('no address passed in query string "address"');
	    }
	}
	else {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.end('not a valid url, you might want to try "http://localhost:8080/i/want/title/"')
	}
}).listen(8080);