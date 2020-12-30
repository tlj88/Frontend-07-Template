/**
 * KMP算法
 *
 * @param {*} source
 * @param {*} pattern
 * @returns
 */
function kmp(source, pattern) {
    // 构建table
    let table = new Array(pattern.length).fill(0)
    {
        let i = 1   // 排除边界
        let j = 0
        while(i < pattern.length - 1) {     // 排除边界
            if (pattern[i] === pattern[j] || pattern[i] === '?' || pattern[j] === '?') {    // 支持?
                table[i + 1] = j + 1
                i++
                j++    
            } else {    
                if(j > 0) {
                    j = table[j]
                } else {
                    i++
                }
            }
        }
    }
    console.log('table', table)

    // 遍历
    {
        let i = kmp.lastIndex || 0
        let j = 0
        while(i < source.length) {
            if(source[i] === pattern[j] || pattern[j] === '?') {
                i++
                j++
            } else {
                if(j > 0) {
                    j = table[j]    // 回退j，不是统一回退到0
                } else {
                    i++
                }
            }
            if (j === pattern.length) {
                kmp.lastIndex = i
                return true
                // return i    // 返回匹配的最后一个字符的后一位
            }
        }
        kmp.lastIndex = 0
        return false
    }
}

// console.log(kmp('abc', 'abc'), kmp.lastIndex)
// console.log(kmp('abc', 'abc'), kmp.lastIndex)
// kmp.lastIndex = 0
// console.log(kmp('abababcdabceff', 'abcdabce'), kmp.lastIndex)
// console.log(kmp('abababcdabceff', 'abcdabce'), kmp.lastIndex)

console.log(kmp('abc', 'a?c'))


module.exports = kmp

