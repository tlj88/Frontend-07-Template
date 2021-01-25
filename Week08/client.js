const net = require('net')

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
                console.log('data: ', data.toString())

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
        console.log(str)
        return str
    }
}

class ResponseParser {
    constructor() {
        this.WAITING_STATUS_LINE = 0
        this.WAITING_STATUS_LINE_END = 1
        this.WAITING_HEADER_NAME = 2
        this.WAITING_HEADER_SPACE = 3
        this.WAITING_HEADER_VALUE = 4
        this.WAITING_HEADER_LINE_END = 5
        this.WAITING_HEADER_BLOCK_END = 6
        this.WAITING_BODY = 7

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = ""
        this.headers = {}
        this.headerName = ""
        this.headerValue = ""
        this.bodyParser = null
    }
    receive(string) {
        for(let char of string) {
            this.reveiveChar(char)
        }
    }
    reveiveChar(char) {
        if(this.current === this.WAITING_STATUS_LINE) {
            if(char === '/r') {
                this.current = this.WAITING_STATUS_LINE_END
            } else {
                this.statusLine += char
            }
        } else if(this.current === this.WAITING_STATUS_LINE_END) {
            if(char === '/n') {
                this.current = this.WAITING_HEADER_NAME
            } else {
                // TODO 不是 /n 怎么处理呢？ 要抛错误吗？
            }
        } else if(this.current === this.WAITING_HEADER_NAME) {
            if(char === '/r') {
                this.current = this.WAITING_HEADER_BLOCK_END
                if(this.headers['Transfer-Encoding'] === 'chunked') {
                    this.bodyParser = new TrunkedBodyParser()
                } else {
                    // TODO 其他种类的bodyParser
                }
            } else if(char === ':') {
                this.current = this.WAITING_HEADER_SPACE
            } else {
                this.headerName += char
            }
        } else if(this.current === this.WAITING_HEADER_SPACE) {
            if(char === ' ') {
                this.current = this.WAITING_HEADER_VALUE
            } else {
                // TODO 要抛错误吗？
            }
        } else if(this.current === this.WAITING_HEADER_VALUE) {
            if(char === '/r') {
                this.current = this.WAITING_HEADER_LINE_END
                this.headers[this.headerName] = this.headerValue
                this.headerName = ''
                this.headerValue = ''
            } else {
                this.headerValue += char
            }
        } else if(this.current === this.WAITING_HEADER_LINE_END) {
            if(char === '/n') {
                this.current = this.WAITING_HEADER_NAME
            } else {
                // TODO 抛错误吗
            }
        } else if(this.current === this.WAITING_HEADER_BLOCK_END) {
            if(char === '/n') {
                this.current = this.WAITING_BODY
            } else {
                // TODO 抛错误吗？
            }
        } else if(this.current === this.WAITING_BODY) {
            // console.log(char)
            this.bodyParser.receiveChar(char)
        }

    }
    get isFinished() {
        return this.bodyParser && this.bodyParser.isFinished
    }
    get response() {
        this.statusLine.match(/HTTP\/1.1 ([0-9]+) ([\s\S]+)/)
        return {
            statusCode: RegExp.$1,
            statusText: RegExp.$2,
            headers: this.headers,
            body: this.bodyParser.content.join('')
        }
    }

}

class TrunkedBodyParser{
    constructor() {
        this.WAITING_LENGTH = 0
        this.WAITING_LENGTH_LINE_END = 1
        this.READING_CHUNK = 2
        this.WAITING_NEW_LINE = 3
        this.WAITING_NEW_LINE_END = 4

        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = this.WAITING_LENGTH
    }
    receiveChar(char) {
        if(this.current === this.WAITING_LENGTH) {
            if(char === '/r') {
                this.current = this.WAITING_LENGTH_LINE_END
                if(this.length === 0) {
                    this.isFinished = true
                }
            } else {
                this.length *= 16
                this.length += parseInt(char, 16)
            }
        } else if(this.current === this.WAITING_LENGTH_LINE_END) {
            if(char === '/n') {
                this.current = this.READING_CHUNK
            }
        } else if(this.current === this.READING_CHUNK) {
            this.content.push(char)
            this.length--
            if(this.length === 0) {
                this.current = this.WAITING_NEW_LINE
            }
        } else if(this.current === this.WAITING_NEW_LINE) {
            if(char === '/r') {
                this.current = this.WAITING_NEW_LINE_END
            }
        } else if(this.current === this.WAITING_NEW_LINE_END) {
            if(char === '/n') {
                this.current = this.WAITING_LENGTH
            }
        }
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
    console.log('response: ', res)
}()


/**
 * 第一步：构造HTTP请求
 *  设计一个HTTP请求的类
 *  content type是一个必要的字段，要有默认值
 *  body是KV格式
 *  不同content type影响body的格式
 * 
 * 第二步：send函数总结
 *  在Request的构造器中收集必要的信息
 *  设计一个send函数，把请求真实发送到服务器
 *  send函数应该是异步的，所以返回Promise
 * 
 * 第三步：发送HTTP请求
 *  设计支持已有的connection或者自己新建connection
 *  收到数据传给parser
 *  根据parser的状态resolve Promise
 * 
 * 第四步：ResponseParser总结
 *  Response必须分段构造，所以我们要用一个ResponseParser来“装配”       为什么必须分段构造
 *  ResponseParser分段处理ResponseText，我们用状态机来分析文本的结构
 * 
 * 第五步：BodyParser总结
 *  Response的body可能根据Content-type有不同的结构，因此我们会采用子parser的结构来解决问题
 *  以TrunkedBodyParser为例，我们同样用状态机来处理body的结构
 */