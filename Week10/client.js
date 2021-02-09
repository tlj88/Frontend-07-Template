const net = require('net')
const ResponseParser = require('./ResponseParser')
const HtmlParser = require('./HtmlParser')
const render = require('./render')
const images = require('images')

class Request {
    constructor(config) {
        this.host = config.host
        this.port = config.port || 80
        this.method = config.method || 'GET'
        this.path = config.path || '/'
        this.headers = config.headers || {}
        this.body = config.body || {}
        if(!this.headers['Content-type']) {
            this.headers['Content-type'] = 'application/x-www-form-urlencoded'
        }
        if(this.headers['Content-type'] === 'application/json') {
            this.bodyText = JSON.stringify(this.body)
        } else if(this.headers['Content-type'] === 'application/x-www-form-urlencoded') {
            this.bodyText = Object.keys(this.body).map(key => `${key}=${encodeURIComponent(this.body[key])}`).join('&')
        }
        this.headers['Content-length'] = this.bodyText.length
    }
    send(connection) {
        return new Promise((resolve, reject) => {
            const parser = new ResponseParser()
            if(connection) {
                connection.write(this.toString())
            } else {
                connection = net.createConnection({
                    host: this.host,
                    port: this.port
                }, () => {
                    connection.write(this.toString())
                })
            }
            connection.on('data', (data) => {   // data 是Buffer数据
                // console.log('data: ', data.toString())

                parser.receive(data.toString())

                if(parser.isFinished) {
                    resolve(parser.response)
                    connection.end()
                }
            })
            connection.on('error', (err) => {
                console.error(err)
                connection.end()
            })
        })
    }
    toString() {
        const str = `${this.method} ${this.path} HTTP/1.1\r\n${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}\r\n
${this.bodyText}`
        // console.log(str)
        return str
    }
}





void async function () {
    let req = new Request({
        host: '127.0.0.1',      // IP协议需要
        port: 8080,           // TCP协议需要
        method: 'POST',         // 以下都是HTTP协议需要
        path: '/',
        headers: {
            ['X-Foo2']: 'customed'
        },
        body: {
            name: 'winter'
        }
    })
    let res = await req.send()
    // console.log('response: ', res)
    let dom = HtmlParser.parseHtml(res.body)   // TODO 目前是没有body这个字段的
    
    let viewport = images(800, 600)
    render(viewport, dom.children[0].children[3].children[1].children[3])

    viewport.save('viewport.jpg')
}()




