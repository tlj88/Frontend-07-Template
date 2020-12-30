/**
 * 模式匹配：判断source是否匹配pattern，匹配返回true，否则返回false
 *
 * @param {*} source
 * @param {*} pattern
 */
// 正则表达式版
function wildcard(source, pattern) { 
    // 根据*对pattern进行分段，分别匹配
    let i = 0           // 记录pattern的位置
    let lastIndex = 0   // 记录source的位置

    // 从开头开始匹配，字符逐个匹配，直到遇到*号
    for (i = 0; pattern[i] !== '*' && i < pattern.length; i++) {  
        if (source[i] !== pattern[i] && pattern[i] !== '*') { 
            return false
        }
    }
    if (i === pattern.length) { 
        return true
    }
    lastIndex = i


    // 统计*个数，并记录*的位置，方便分段匹配
    let starPosition = []
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '*') { 
            starPosition.push(i)
        }
    }
    console.log('starPosition: ', starPosition)

    // 分段进行匹配
    for (let j = 0; j < starPosition.length - 1; j++) { 
        let subPattern = pattern.slice(starPosition[j] + 1, starPosition[j + 1])    // subPattern中不包含*
        subPattern = subPattern.replace(/\?/g, '[\\s\\S]')
        console.log('subPattern', subPattern)

        let regExp = new RegExp(subPattern, 'g')
        regExp.lastIndex = lastIndex
        console.log('lastIndex', lastIndex)

        if (!regExp.exec(source)) { 
            return false
        }
        lastIndex = regExp.lastIndex
    }

    // 判断最后一段内容
    // 从source末尾开始匹配
    for (let j = 1; pattern[pattern.length - j] !== '*'; j++) { 
        if (source[source.length - j] !== pattern[pattern.length - j] && pattern[pattern.length - j] !== '?') { 
            return false
        }
    }

    return true
}

// console.log(wildcard('heloo', 'heloo'))
console.log(wildcard('abkf*gdaffdeadfge', 'ab*d?f*fde*ad??e'))





// 'ab *df *fde * adf?e'
// * 匹配 零个、一个 或者 多个字符
// ? 匹配 一个字符

// 算法

