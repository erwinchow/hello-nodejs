var querystring = require("querystring"),
fs = require("fs");

function sleep(milliSecond){
    var startTime = new Date().getTime();
    while(new Date().getTime() < startTime+milliSecond);
}

var exec = require("child_process").exec;

function start(response, postData){
    //这里的阻塞会导致其他handler（upload）在不同页面时也会阻塞；
    //这就需要事件轮询
    //sleep(5000);

    var content = "empty content"
    exec("dir", function(error, stdout, stderr){
        content = stdout;
    })

    var body = '<html>'+
    '<head>'+
    '<meta http-equiv="Content-Type" content="text/html; '+
    'charset=UTF-8" />'+
    '</head>'+
    '<body>'+
        '<form action="/upload2" method="post">'+
            '<textarea name="text" rows="20" cols="60"></textarea>'+
            '<input type="submit" value="Submit text" />'+
        '</form>'+
        '<form action="/upload" enctype="multipart/form-data" '+
        'method="post">'+
            '<input type="file" name="upload">'+
            '<input type="submit" value="Upload file" />'+
        '</form>' +
    '</body>'+
    '</html>';


    console.log("handler start was called");
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write(body);
    response.end();
    //return content;
}

function upload(response, postData){
    console.log("handler upload was called, postData length=" + postData.length);

    function cleanPostData(dataBuffer) {
        const content = dataBuffer.toString();
        let lines = content.split('\n');
        const findFlagNo = (arr, flag) => arr.findIndex(o => o.includes(flag));
        // 查找 ----- Content-Disposition Content-Type 位置并且删除
        const startNo = findFlagNo(lines, '------');
        lines.splice(startNo, 1);
        const ContentDispositionNo = findFlagNo(lines, 'Content-Disposition');
        lines.splice(ContentDispositionNo, 1);
        const ContentTypeNo = findFlagNo(lines, 'Content-Type');
        lines.splice(ContentTypeNo, 1);
        // 最后的 ----- 要在数组末往前找
        const endNo = lines.length - findFlagNo(lines.reverse(), '------') - 1;
        // 先反转回来
        lines.reverse().splice(endNo, 1);
        return Buffer.from(lines.join('\n'));
    }
    function cleanPostData2(dataBuffer) {
        let left = dataBuffer.indexOf("FFD8FFE0", 0, "hex"); 
        let right = dataBuffer.indexOf("FFD9", left+1, "hex");
        return dataBuffer.slice(left, right);
    }

    imgBuffer = cleanPostData2(postData);
    //imgBuffer = postData
    console.log("handler upload was called, imgBuffer length=" + imgBuffer.length);  
    fs.writeFile("./resources/test.jpg", imgBuffer, "binary", function(err){
        if(err){
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error+ "\n");
            response.end();        
        }else{
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write("received image:<br/>");
            response.write("<img src='/show' />");
            response.end();
        }
    })

    /*
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("upload??? " + postData);
    response.end();
    */
    //return "hello, upload";
}

function show(response, postData){
    console.log("handler show was called");
    //fs.readFile("./resources/AarhusInfinite_ZH-CN1981168082_1920x1080.jpg", "binary", function(error, file){
    fs.readFile("./resources/test.jpg", "binary", function(error, file){
        if (error){            
            response.writeHead(500, {"Content-Type": "text/plain"});
            response.write(error+ "\n");
            response.end();
        }else{
            response.writeHead(200, {"Content-Type": "image/jpeg"});
            response.write(file, "binary");
            response.end();
        }
    });
}

exports.start = start
exports.upload = upload
exports.show = show
