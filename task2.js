

// to make http requests
var http = require('http');

// to parse urls inorder to get components a url is composed of (host, path etc...)
var url = require('url');

// to parse html
var cheerio = require('cheerio');

// flow control module
var async = require('async');

// create http server and start listening on port 8081
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

   	    	// request to each website address in series fashion
   	    	async.eachSeries(addresses, function(address, callback){

   	    		var addressFromQueryString = address;	

   	    		// add protocol if address does not have already. this is 
   	    		if ( !address.startsWith('https://') && !address.startsWith('http://') ) {
   	    			address = 'http://' + address;
   	    		}
   	    		var requestUrlObject = url.parse(address, true);

   	    		// create request options
				var requestOptions = {
				  host: requestUrlObject.hostname,
				  path: requestUrlObject.pathname
				};

				requestCallback = function(websiteResonse) {
					// initialize object that will hold response from request
					var htmlDocument = '';
					
					// append data each time data is available
					websiteResonse.on('data', function (data) {
					    htmlDocument += data;
					});

					websiteResonse.on('end', function () {				
						addTitleInResponse(addressFromQueryString, htmlDocument);		
						callback();			  					    
				    });
				}

				var httpRequest = http.request(requestOptions, requestCallback);

				// if error occures for any address then add error response and proceed
				httpRequest.on('error', function(error) {
					addTitleInResponse(addressFromQueryString);
					callback();
				});
				httpRequest.end();

   	    	}, function() {
   	    		// callback when all addresses have been requested
   	    		htmlResponse = htmlResponse + '</ul></body></html>';
			    response.end(htmlResponse);
			    console.log(new Date().getTime()-start);
   	    	});

   	    	// callback function when request is completed either successful or non successful
   	    	var addTitleInResponse = function(address, websiteResonse) {

   	    		if ( websiteResonse ) {
			    	// load documet via cheerio
				  	$ = cheerio.load(websiteResonse);
				  	// append list item in response
				  	htmlResponse = htmlResponse + '<li> ' + address + ' - "' + $('title').text() + '" </li>';		
			    }
			    else {
			    	htmlResponse = htmlResponse + '<li> ' + address + ' - NO RESPONSE </li>';
			    }
   	    	};
	    }
	    else {
	    	response.end('no address passed in query string "address"');
	    }
	}
	else {
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.end('not a valid url, you might want to try "http://localhost:8081/i/want/title/"')
	}
}).listen(8081);