/**
 * 规则：
 *  双方分别持有 圆圈 和 叉 两种棋子；
 *  双方交替落子；
 *  率先连成三子直线的一方获胜；
 */

const EMPTY = 0  // 空
const ROUND = 1  // 圆
const CROSS = 2  // 叉

let board = [
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY],
    [EMPTY, EMPTY, EMPTY]
]

let mountDOM = document.getElementById('app')
let current = ROUND
let isGameStoped = false    // 判断游戏是否结束
let count = 0   // 记录落棋个数

function getChessText(color) {
    return color === ROUND ? '⭕' :
    color === CROSS ? '❌' : ''
}

// 绘制棋盘
// 每次都是整个棋盘重新绘制，待优化
function drawTheBorad() {
    // 清空绘制
    mountDOM.innerHTML = ''
    for(let row = 0; row < 3; row++) {  // 行
        for(let col = 0; col < 3; col++) {  // 列
            let cell = document.createElement('div')
            cell.classList.add('cell')
            cell.innerHTML = getChessText(board[row][col])

            cell.addEventListener('click', () => {
                // 游戏结束，则不能再落子了
                if (board[row][col] === EMPTY && !isGameStoped) {  
                    userMove(row, col)
                }
            })

            mountDOM.appendChild(cell)
        }
        mountDOM.appendChild(document.createElement('br'))
    }
}
// 落子
function move(row, col) {
    board[row][col] = current
    count++
    drawTheBorad()
    
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
    


    // if(count >= 4 && willWin(board, current)) {
    //     console.log(getChessText(current) + ' will win.')
    //     return
    // }

    // console.log(getChessText(current), ' bestChoice: ', bestChoice(board, current))
}

function userMove(row, col) {
    move(row, col)

    setTimeout(() => {
        computerMove()
    }, 100)
}

function computerMove() {
    let p = bestChoice(board, current).point
    if (p) {
        move(p[0], p[1])
    }
}

// 判断当前落子的胜负
// 没有判断三横三纵以及两条斜角，而是根据最新落棋点来判断
// 只需判断落棋点所在横、纵，如果落棋点在斜角，则需多判断两条斜角
function judgeWin(board, color, row, col) {
    // 判断是否位于斜角
    if (row === col) {
        if(board[0][0] === color && board[1][1] === color && board[2][2] === color) {
            return true
        }
        // 判断是否位于正中间，正中间的话需要判断两条斜角
        if (2 - row === col) {
            if(board[0][2] === color && board[1][1] === color && board[2][0] === color) {
                return true
            }
        }
    }
    // 判断同一行
    if(board[row][0] === color && board[row][1] === color && board[row][2] === color) {
        return true
    }
    // 判断同一列
    if(board[0][col] === color  && board[1][col] === color && board[2][col] === color) {
        return true
    }
    return false
}

function willWin(board, color) {
    for(let row = 0; row < 3; row++) {
        for(let col = 0; col < 3; col++) {
            if (board[row][col] !== EMPTY) {
                continue;
            }
            let virtualBoard = cloneBoard(board)
            virtualBoard[row][col] = color
            if (judgeWin(virtualBoard, color, row, col)) {
                return [row, col]
            }
        }
    }
    return null
}

// 按照对弈双方都是最理智的来判断
function bestChoice(board, color) {
    let p = willWin(board, color)
    if (p) {
        return {
            result: 1,
            point: p
        }
    }

    let result = -2      // -1-输 0-和 1-赢
    let point = null

    outer: for(let row = 0; row < 3; row++) {
        for(let col = 0; col < 3; col++) {
            if (board[row][col] !== EMPTY) {
                continue
            }

            const virtualBoard = cloneBoard(board)
            virtualBoard[row][col] = color
            let r = bestChoice(virtualBoard, 3 - color).result  // 对方最好的结果

            if (-r > result) {  // 我方最坏的结果
                result = -r
                point = [row, col]
            }

            if (result === 1) {
                break outer
            }
        }
    }

    return {
        point,
        result: point ? result : 0
    }
}

function cloneBoard(board) {
    return JSON.parse(JSON.stringify(board))
}

drawTheBorad()







