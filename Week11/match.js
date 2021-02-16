
/**
 * 目前只支持 空格连接符
 * @param {*} selector 
 * @param {*} element 
 */
function match(selector, element) {
    let splitSelector = selector.split(' ').reverse()
    // console.log('splitSelector', splitSelector)

    let i = 0
    let result = false
    while(element && i < splitSelector.length) {
        result = matchCompoundSelector(splitSelector[i], element)
        // console.log('matchCompoundSelector', result)
        if(result) {
            i++
        } else {
            if(i===0) {
                return false
            }
        }
        element = element.parentNode
        if(element.tagName === document) {
            element = ''
        }
    }
    return result
}
/**
 * 匹配复合选择器 type / id / class
 * @param {*} simpleSelector 
 * @param {*} element 
 */
function matchCompoundSelector(compoundSelector, element) {
    let regExp = /#([a-zA-Z-]+)|\.([a-zA-Z-]+)|([a-zA-Z-]+)/g
    let result = null
    let matchResult = true
    debugger
    while(true) {
        result = regExp.exec(compoundSelector)
        if(!result) {
            return matchResult
        }
        if(result[1]) { // id
            let id = element.getAttribute('id')
            if(id === result[1]) {
                matchResult = true && matchResult
            } else {
                matchResult = false && matchResult
            }
        } else if(result[2]) {  // class
            let classNames = element.className
            if(classNames) {
                classNames = classNames.split(/[\t ]+/)
                matchResult = classNames.some((className) => {
                    return className === result[2]
                }) && matchResult
            } else {
                matchResult = false && matchResult
            }
        } else if(result[3]) {  // type
            matchResult = matchResult && element.tagName.toLowerCase() === result[3]
        }
    }

    return false
}

match('div#layout #gk-layer', document.getElementById('gk-layer'))
// match("div #id.class", document.getElementById("id"))