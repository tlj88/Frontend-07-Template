const http = require('http')

let server = http.createServer((request, response) => {
    let body = []
    request
    .on('error', (err) => {
        console.error(err)
    })
    .on('data', (chunk) => { // chunk是buffer数据
        console.log('data:  ', chunk)
        // body.push(chunk.toString())
        body.push(chunk)
    })
    .on('end', () => {
        body = Buffer.concat(body).toString()
        console.log('body: ', body)
        response.writeHead(200, {'Content-type': 'text/html', 'Transfer-Encoding': 'chunked'})
        // response.write(Buffer.concat(body).toString())
        // response.end('Hello World!\n')
        response.end(`
<html>
    <head>
        <title>Hello</title>
        <style>
           #container {
               width: 500px;
               height: 300px;
               display: flex;
               background-color: rgb(255,255,255);
           }
           #container #myid {
               width: 200px;
               height: 100px;
               background-color: rgb(255,0,0);
           }
           #container .c1 {
               flex: 1;
               background-color: rgb(0,255,0);
           }
        </style>
    </head>
    <body>
        <div id="container">
            <div id="myid" />
            <div class="c1" />
        </div>
    </body>
</html>`)
    })
}).listen(8080, () => {
    console.log('server is running')
})
