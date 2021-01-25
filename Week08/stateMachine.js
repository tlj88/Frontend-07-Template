
/**
 * 字符串匹配  普通写法 VS 状态机
 * 已知patter，pattern='abc'
 *
 * @param {*} source
 */
function match_normal(source) { 
    let foundA = false
    let foundB = false
    for (let char of source) { 
        if (char === 'a') {
            foundA = true
        } else if (foundA && char === 'b') {
            foundB = true
        } else if (foundB && char === 'c') {
            return true
        } else { 
            foundA = false
            foundB = false
        }
    }
    return false
}
function match_stateMachine(source) { 
    let state = start
    for (let char of source) { 
        state = state(char)
    }
    return state === end
}
function end(char) { 
    return end      // 技巧：结束中始终返回结束状态
}
function start(char) { 
    if (char === 'a') {
        return foundA
    } else { 
        return start       // 若是第一个'a'没有匹配上，则去匹配source的下一个字符
    }
}
function foundA(char) {
    if (char === 'b') {
        return foundB
    } else { 
        return start(char)   // 若是char没有匹配上'b'，那么char应该与'a'再匹配一次
    }
}
function foundB(char) { 
    if (char === 'c') {
        return end      // 匹配结束返回 结束状态
    } else { 
        return start(char)
    }
}



/**************************************** 分隔线 ************************************/
/**
 * 状态机
 * 已知patter，patter='abcabd'
 *
 * @param {*} source
 */
function match_stateMachine(source) { 
    let state = start
    for (let char of source) { 
        state = state(char)
    }
    return state === end

}
function end(char) { 
    return end
}
function start(char) { 
    if (char === 'a') {
        return foundA
    } else { 
        return start
    }
}
function foundA(char) { 
    if (char === 'b') {
        return foundB
    } else { 
        return start(char)
    }
}
function foundB(char) { 
    if (char === 'c') {
        return foundC
    } else { 
        return start(char)
    }
}
function foundC(char) { 
    if (char === 'a') {
        return foundA2
    } else { 
        return start(char)
    }
}
function foundA2(char) { 
    if (char === 'b') {
        return foundB2
    } else { 
        return foundA(char)     // 有重复值
    }
}
function foundB2(char) { 
    if (char === 'd') {
        return end
    } else { 
        return foundB(char)
    }
}




/**************************************** 分隔线 ************************************/

/**
 * 字符串匹配
 * 状态机，patter未知
 * 参考KMP，先生成table，再根据table生成状态机
 *
 * @param {*} source
 * @param {*} pattern
 */
function match(source, pattern) { 
    // 建表
    let table = new Array(pattern.length).fill(0)
    { 
        let i = 0
        let j = 1
        while (j < pattern.length - 1) {   // ababcdabbe
            if (pattern[j] === pattern[i]) {
                table[j + 1] = i + 1
                i++
                j++
            } else { 
                if (i > 0) {        // 能够确保最终i回到0
                    i = table[i]
                } else { 
                    j++
                }
            }
        }
    }
    console.log('table: ', table)
    
    // 建立状态机
    let states = {}
    { 
        for (let i = 0; i < pattern.length; i++) { 
            states[`state_${i}`] = function (char) { 
                if (char === pattern[i]) {
                    return states[`state_${i + 1}`]
                } else { 
                    return i === 0 ? states[`state_${table[i]}`] : states[`state_${table[i]}`](char)
                }
            }
        }
        states[`state_${pattern.length}`] = function (char) { 
            return states[`state_${pattern.length}`]
        }
    }
    console.log('states: ', states)

    // 匹配
    {
        let state = states['state_0']
        for(let char of source) { 
            state = state(char)
        }
        return state === states[`state_${pattern.length}`]
    }
}


console.log(match('abababx', 'abababx'))
console.log(match('ababababxab', 'abababx'))
console.log(match('ababcababxab', 'abababx'))
