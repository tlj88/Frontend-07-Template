/** 
 *  字典树
 */
let $ = Symbol('$')
class Trie {
    constructor() {
        this.root = Object.create(null)
    }
    insert(word) {
        let node = this.root
        for(let c of word) {
            // if(node[c]) {
            //     node = node[c]
            // } else {
            //     node[c] = Object.create(null)
            // }
            if(!node[c]) {
                node[c] = Object.create(null)
            }
            node = node[c]
        }
        // if(node[$]) {
        //     node[$] = node[$] + 1
        // } else {
        //     node[$] = 1 
        // }

        // 标记word的结束符，为了区分 abc 和 ab这种情况，也可以用来记录word出现的次数
        if(!node[$]) {
            node[$] = 0
        }
        node[$] = node[$] + 1
        
    }
    most() {
        let node = this.root
        let maxWord = ''
        let max = 0

        function walk(node, word){
            if(node[$]) {
                if(node[$] > max) {
                    max = node[$]       // 如果多个word出现次数相同， 则会取第一个，如何把多个同时取出？
                    maxWord = word
                }
                return
            }
            for(let c in node) {
                walk(node[c], word + c)
            }
        }

        walk(this.root, '')
        console.log(maxWord, ' ', max)
    }
}

function randomString(length) {
    let str = ''
    for(let i = 0; i < length; i++) {
        str += String.fromCharCode(Math.random() * 26 + 'a'.charCodeAt(0))
    }
    return str
}

let trie = new Trie()

for(let i = 0; i < 26 * 26 * 26 * 26; i++) {
    trie.insert(randomString(4))
}
console.log(trie)
trie.most()