
function route(handle, pathname, response, postData) {
    console.log("route!!!");
    if( typeof handle[pathname] ==='function' ) {
        handle[pathname](response, postData);
    }else{
        console.log("no request handler found");
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not found");
        response.end();
    }
}
exports.route = route;

var server = require("./server")