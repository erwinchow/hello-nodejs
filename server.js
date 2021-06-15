console.log("hello world");

var http = require("http");
var url = require("url");

const { route } = require("./route");

/*
http.createServer(function(request, response){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("hello world");
    response.end()
}).listen(8888);
*/

function say(word) {
    console.log(word);    
}

function execute(someFunction, value){
    someFunction(value);
}

execute(say, "hello")


//function start() {
function start(route, handle) {
    function onRequest(request, response){
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname);

        var postData = Buffer.alloc(0);
        //request.setEncoding("utf8");
        request.addListener("data", function(postDataChunk){
            //postData += postDataChunk;
            postData = Buffer.concat([postData, postDataChunk]);
            console.log("receive post data chunk size: " + postDataChunk.length + " " + postData.length);
        });
        request.addListener("end", function(){            
            route(handle, pathname, response, postData);
        });        

        /*
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write("hello world(from function)");
        response.end()
        */
    }

    var port = 8888;
    http.createServer(onRequest).listen(port);
    console.log("Server has started at " + port);
}

exports.start = start;
