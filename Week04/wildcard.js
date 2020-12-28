/**
 * 模式匹配：判断source是否匹配pattern，匹配返回true，否则返回false
 *
 * @param {*} source
 * @param {*} pattern
 */
function wildcard(source, pattern) { 
    // 统计*个数，并记录*的位置
    let starPosition = []
    for (let i = 0; i < pattern.length; i++) {
        if (pattern[i] === '*') { 
            starPosition.push(i)
        }
    }
    console.log('starPosition: ', starPosition)

    // pattern中没有*号
    if (!starPosition.length) { 
        if (source.length != pattern.length) { 
            return false
        }
        for (let i = 0; i < source.length; i++) {
            if (source[i] !== pattern[i] && pattern[i] !== '?') { 
                return false
            }
        }
        return true
    }

    // 根据*对pattern进行分段，分别匹配
    // let splitPattern = pattern.split('*')
    // console.log('splitPattern', splitPattern)
    let lastIndex = 0
    for (let i = 0; i < starPosition.length; i++) { 
        let index = starPosition[i]
    }



    // 判断最后一段内容


    return false
}
// console.log(wildcard('helloof', 'heloo'))
console.log(wildcard('abkfgdffdeadfge', 'ab*df*fde*adf?e'))

// 'ab *df *fde * adf?e'
// * 匹配 零个、一个 或者 多个字符
// ? 匹配 一个字符

