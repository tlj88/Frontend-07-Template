# 学习笔记


## 问题记录

### 1、emoji展示乱码问题
【问题】通过api dom.innerText = '⭕' 往dom节点中添加emoji文字时，出现展示乱码的问题，如下图所示：
![乱码](https://thumbnail0.baidupcs.com/thumbnail/cb6b5b11fq2f9625f9a3cf1e97488535?fid=3742423178-250528-119697139091028&rt=pr&sign=FDTAER-DCb740ccc5511e5e8fedcff06b081203-pzG7Zrl42a3W%2bIiAkITEAUZya6U%3d&expires=8h&chkbd=0&chkv=0&dp-logid=7898615233605930420&dp-callid=0&time=1607230800&size=c1440_u900&quality=90&vuk=3742423178&ft=image&autopolicy=1)

【原因】和页面编码有关

【解决】在html文档中增加一行元数据
```html
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
```



### 2、alert 与 页面渲染 顺序问题
在实现ticTacToe游戏的过程中，有一个落子方法move。在方法内部，先调用show方法去修改DOM树，之后才判断胜负，调用alert方法，弹出提示框。但是每次都是关闭提示框之后，最新的棋盘才会渲染出来。   
为了实现“先渲染最新棋盘，再出提示框”的效果，我用setTimeout(() => {}, 0)方法对alert进行了包裹，也还是不行，需要调整等待时长。   
这里就有点疑惑，**页面绘制**和**宏任务**之间的优先级关系到底是怎么样的？我的理解是页面绘制的优先级高于宏任务

```javascript
function move(row, col) {
    board[row][col] = current
    count++
    show()
    setTimeout(() => {
        if (count >= 5) {
            if(judgeWin(board, current, row, col)) {
                isGameStoped = true
                alert('The winner is ' + getChessText(current))
                return
            }
            if (count >= 9) {
                isGameStoped = true
                alert('It is a tie')
                return 
            }
        }
        current = 3 - current
    }, 4)
}
```




## 小技巧
1、复制  
（1）方法一
```javascript
let arr = [[0, 0, 0], [0, 0, 0], [0, 0, 0]]
let copy = JSON.parse(JSON.stringify(arr))
```

（2）方法二
```javascript
let arr = [1, 2, 3]
let copy = Object.create(arr)
```
优点：可以避免重复生成被复制对象(arr)，被复制对象成为复制对象(copy)的原型，所有复制对象共用一个被复制对象，可以减小内存占用。  

缺点：虽然复制对象继承自数组arr，继承了arr的方法和属性，但是它的表现和一个数组还是有区别的，要知道这种区别。
```javascript
let arr = [1, 2, 3]
let copy = Object.create(arr)
copy[3] = 4
console.log(arr.length)     // 3
console.log(copy.length)    // 3
console.log(copy[3])        // 4

console.log(Object.prototype.toString.call(arr))    // [object Array]
console.log(Object.prototype.toString.call(copy))   // [object Object]

```

2、跳出多层循环
```javascript
outer: for(let i = 0; i < 3; i++) {
    for(let j = 0; j < 3; j++) {
        break outer
    }
}
```

