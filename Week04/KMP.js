function kmp(source, pattern) {
    // 构建table
    let table = new Array(pattern.length).fill(0)
    {
        let i = 1
        let j = 0
        while(i < pattern.length) {
            if(pattern[i] === pattern[j]) {
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

    // 遍历
    {
        let i = 0
        let j = 0
        while(i < source.length) {
            if(source[i] === pattern[j]) {
                i++
                j++
            } else {
                if(j > 0) {
                    j = table[j]    // 回退j，不是统一回退到0
                } else {
                    i++
                }
            }
            if(j === pattern.length) {
                return true
            }
        }
        return false
    }

}
console.log(kmp('abc', 'abc'))

