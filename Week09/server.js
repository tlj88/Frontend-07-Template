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
            body div img#myid {
                width: 100px;
                background-color: #ff5000;
            }
            body div img {
                width: 30px;
                background-color: #ff1111;
            }
        </style>
    </head>
    <body>
        <div>
            <img id="myid" />
            <img />
        </div>
    </body>
</html>`)
    })
}).listen(8080, () => {
    console.log('server is running')
})
