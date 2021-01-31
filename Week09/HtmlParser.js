


const { match } = require('assert')
/**
 * html标签：开始标签、结束标签、自封闭标签
 */

/**
 *
 * 状态：tagOpen(标签开始)、endTagOpen(结束标签开始)、tagName(标签名)、beforeAttributeName、selfClosingStartTag
 *  
 */
const css = require('css')

// 解析HTML文本时使用
let EOF = Symbol('EOF')
let currentToken = null
let currentAttribute = null

// 构建DOM树时使用
let stack = [{
    type: 'document',
    children: []
}]
let currentTextNode = null

// 解析CSS规则时使用
let rules = []
function addCSSRules(text) {
    let ast = css.parse(text)
    // console.log(JSON.stringify(ast, null, "      "))
    rules.push(...ast.stylesheet.rules)
}
function computeCSS(element){
    console.log('rules', rules)
    console.log('compute CSS for Element', element)
    var elements = stack.slice().reverse()   // 当前元素element的所有父元素，不包含当前元素
    if(!element.computedStyle) {
        element.computedStyle = {}
    }
    for(let rule of rules) {
        var selectorParts = rule.selectors[0].split(' ').reverse()   // 只支持子元素选择器，后继选择器等不支持

        if(!elementMatch(element, selectorParts[0])) {
            return
        }
        let matched = false
        let j = 1
        for(let i = 0; i < elements.length; i++) {
            if(elementMatch(elements[i], selectorParts[j])) {
                j++
            }
        }
        if(j >= selectorParts.length) {
            matched = true
        }
        if(matched) {
            // 如果匹配到，我们要加入到DOM节点中
            // element.computedStyle
            let computedStyle = element.computedStyle
            let sp = specificity(rule.selectors[0])
            for(let declaration of rule.declarations) {
                if(!computedStyle[declaration.property]) {
                    computedStyle[declaration.property] = {}
                }    
                if(!computedStyle[declaration.property].specificity) {
                    computedStyle[declaration.property].specificity = sp
                    computedStyle[declaration.property].value = declaration.value    // 后面的声明 会覆盖前面的声明，没有做优先级处理
                } else {
                    if(compare(sp, computedStyle[declaration.property].specificity) > 0){
                        computedStyle[declaration.property].specificity = sp
                        computedStyle[declaration.property].value = declaration.value
                    }
                }
            }
        }
    }
}
/**
 * 
 * @param {*} element 
 * @param {*} selector  复合选择器  div#id.class  暂不考虑伪类和伪元素
 */
function elementMatch(element, selector) {    // 标签、id(#)、class(.)
    if(!selector || !element.attributes) {
        return false
    }

    let regExp = /#([a-zA-Z]+)|\.([a-zA-Z]+)|([a-zA-Z]+)/g  // 目前只考虑属性值只为英文字符的情况
    let result = null
    let matchResult = true
    while(true) {
        result = regExp.exec(selector)
        if(!result) {   // 匹配结束，先不考虑完全没有匹配的情况
            return matchResult
        }

        if(result[1]) {  // id
            let attr = element.attributes.filter(attr => attr.name === 'id')[0]
            if(attr && attr.value === result[1]) {
                matchResult = true && matchResult
            } else {
                matchResult = false && matchResult
            }
        }  else if(result[2]) {  // class
            let attr = element.attributes.filter(attr => attr.name === 'class')[0]
            if(attr) {
                let classes = attr.split(/[\t ]+/)      // 处理 class=“cl1 cl2 cl3” 这种情况
                
                matchResult = classes.some(c => {
                    return c === result[2]
                }) && matchResult
            } else {
                matchResult = false && matchResult
            }
        } else if(result[3]) { // tag
            if(element.tagName === result[3]) {
                matchResult = true && matchResult
            } else {
                matchResult = false && matchResult
            }
        }  
    }
}
/**
 * 
 * @param {*} selector 复合选择器
 */
function specificity(selector) {
    let sp = [0, 0, 0, 0]
    let selectorParts = selector.split(' ')    // TODO 解析复合选择器   div#id span.class
    let regExp = /#([a-zA-Z]+)|\.([a-zA-Z]+)|([a-zA-Z]+)/g

    for(let part of selectorParts) {
        let result = null
        while(true){
            result = regExp.exec(part)
            if(!result) {
                break
            }
            if(result[1]) { // id
                sp[1] += 1
            } else if(result[2]) {  // class
                sp[2] += 1
            } else if(result[3]) {  // tag
                sp[3] += 1
            }
        }
    }
    return sp
}
// sp1 > sp2 正数；  sp1 < sp2 负数
function compare(sp1, sp2) {
    if(sp1[0] - sp2[0]) {
        return sp1[0] - sp2[0]
    } else if(sp1[1] - sp2[1]) {
        return sp1[1] - sp2[1]
    } else if(sp1[2] - sp2[2]) {
        return sp1[2] - sp2[2]
    } else {
        return sp1[3] - sp2[3]
    }
}

function emit(token){
    console.log(token)
    let top = stack[stack.length - 1]
    if(token.type === 'startTag') {
        let element = {
            type: 'element',
            children: [],
            attributes: [],
            tagName: token.tagName
        }

        for(let a in token) {
            if(a !== 'type' && a !== 'tagName') {
                element.attributes.push({
                    name: a,
                    value: token[a]
                }) 
            }
        }
        computeCSS(element)

        top.children.push(element)
        element.parent = top

        if(!token.isSelfClosing) {
            stack.push(element)
        }

        currentTextNode = null

    } else if(token.type === 'endTag') {
        if(top.tagName === token.tagName) {
            if(token.tagName === 'style') {
                addCSSRules(top.children[0].content)
            }
            stack.pop()
        } else {
            throw new Error("Tag start end doesn't match")
        }
        currentTextNode = null
    } else if(token.type === 'text') {
        if(currentTextNode === null) {
            currentTextNode = {
                type: 'text',
                content: ''
            }
            top.children.push(currentTextNode)
        }
        currentTextNode.content += token.content
    }
    
}

function data(c) {
    if(c === '<') {
        return tagOpen
    } else if(c === EOF) {
        emit({
            type: 'EOF'
        })
        return 
    } else {    // 普通文本字符
        emit({
            type: 'text',
            content: c
        })
        return data
    }
}
function tagOpen(c) {
    if(c === '/') {
        return endTagOpen
    } else if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'startTag',
            tagName: ''
        }
        return tagName(c)
    } else {
        // TODO 不用返回点什么吗？
        return
    }
}
function endTagOpen(c) {
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken = {
            type: 'endTag',
            tagName: ''
        }
        return tagName(c)
    } else if(c === '>') {
        // TODO 报错
    } else if(c === EOF) {
        // TODO 报错
    } else {
        // TODO 报错
    }
}
function tagName(c) {
    if(c.match(/^[a-zA-Z]$/)) {
        currentToken.tagName += c
        return tagName
    } else if(c.match(/^[\t\n\f ]$/)) {   // 空格
        return beforeAttributeName
    } else if(c === '/') {      // 自封闭标签
        return selfClosingStartTag
    } else if(c === '>') {      // 普通标签 标签结束
        emit(currentToken)
        return data
    } else {
        return tagName
    }
}
function beforeAttributeName(c) {  
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if(c === '>' || c === '/' || c === EOF) {
        // emit(currentToken)      // TODO 
        // return data
        return afterAttributeName(c)
    } else if(c === '=') {
       
    } else {
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c)
    }
}

function attributeName(c) {
    if(c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
        return afterAttributeName(c)
    } else if(c === '=') {
        return beforeAttributeValue
    } else if(c === '\u0000') {

    } else if(c === "\"" || c === "\'" || c === "<") {

    } else {
        currentAttribute.name += c
        return attributeName
    }
}

function beforeAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/) || c === '/' || c === '>' || c === EOF) {
        return beforeAttributeValue
    } else if(c === "\"") {
        return doubleQuoteAttributeValue
    } else if(c === "\'") {
        return singleQuoteAttributeValue
    } else if(c === ">") {

    } else {
        return unquoteAttributeValue
    }
}

function doubleQuoteAttributeValue(c) {
    if(c === "\"") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if(c === "\u0000") {

    } else if(c === EOF) {

    } else {
        currentAttribute.value += c
        return doubleQuoteAttributeValue
    }
}

function singleQuoteAttributeValue(c) {
    if(c === "'") {
        currentToken[currentAttribute.name] = currentAttribute.value
        return afterQuotedAttributeValue
    } else if(c === "\u0000") {

    } else if(c === EOF) {

    } else {
        currentAttribute.value += c
        return singleQuoteAttributeValue
    }
}

function unquoteAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        currentToken[currentAttribute.name] = currentAttribute.value
        return beforeAttributeName
    } else if(c === '/') {
        currentToken[currentAttribute.name] = currentAttribute.value
        return selfClosingStartTag
    } else if(c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if(c === '\u0000') {

    } else if(c === "\"" || c === "'" || c === "<" || c === "=" || c === "`") {

    } else {
        currentAttribute.value += c
        return unquoteAttributeValue
    }
}

function afterQuotedAttributeValue(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return beforeAttributeName
    } else if(c === '/') {
        return selfClosingStartTag
    } else if(c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if(c === EOF) {

    } else {    // TODO 这里为什么要这样，不会有问题吗？
        // currentAttribute.value += c
        // return doubleQuoteAttributeValue

        return afterQuotedAttributeValue
    }
}

function afterAttributeName(c) {
    if(c.match(/^[\t\n\f ]$/)) {
        return afterAttributeName
    } else if(c === '/') {
        return selfClosingStartTag
    } else if(c === '>') {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    } else if(c === EOF) {

    } else {
        currentToken[currentAttribute.name] = currentAttribute.value
        currentAttribute = {
            name: '',
            value: ''
        }
        return attributeName(c)
    }
}


function selfClosingStartTag(c) {
    if(c === '>') {
        currentToken.isSelfClosing = true    // TODO currentToken一定是标签吗？不可能是属性吗？
        emit(currentToken)
        return data
    } else if(EOF) {
        // TODO 报错
    } else {
        // TODO 报错
    }
}


module.exports = {
    parseHtml: function(html) {
        // console.log(html)
        let state = data
        for(let c of html) {
            state = state(c)
        }
        state = state(EOF)   // 不太明白 这里为什么要state(EOF)
    }
}


/**
 * 解析HTML步骤
 * 
 * 第一步：总结
 *  为了方便文件管理，我们把parser单独拆分到文件中
 *  parser接受HTML文本作为参数，返回一棵DOM树
 * 
 * 第二步：总结
 *  我们用FSM来实现HTML的分析
 *  在HTML标准里面，已经规定了HTML的状态
 *  Toy-Brower只会挑选其中一部分状态，完成一个最简版
 * 
 * 第三步：解析标签
 *  主要的标签有：开始标签、结束标签和自封闭标签
 *  在这一步我们暂时忽略属性
 * 
 * 第四步：总结
 *  在状态机中，除了状态迁移，我们还要会加入业务逻辑
 *  我们在标签结束状态提交标签token
 * 
 * 第五步：属性解析
 *  属性值分为单引号、双引号、无引号三种写法，因此需要较多状态处理
 *  处理属性的方式跟标签类似
 *  属性结束时，我们把属性加到标签Token上
 * 
 * 第六步：构建dom树
 *  从标签构建DOM树的基本技巧是使用栈
 *  遇到开始标签时创建元素并入栈，遇到结束标签时出栈
 *  自封闭节点可视为入栈后立刻出栈
 *  任何元素的父元素是它入栈前的栈顶
 * 
 * 第7步：文本节点处理
 *  文本节点与自封闭标签处理类似
 *  多个文本节点需要合并
 */


 /**
  * CSS解析
  * 
  * 第一步：收集css规则
  *  遇到style标签时，我们把css规则保存起来
  *  这里我们调用css parser来分析css规则，生成css ast
  *  这里我们必须要仔细研究此库分析css规则的格式，也就是css ast的格式
  * 
  * 第二步：computeCSS
  *  当我们创建一个元素后，立即计算CSS
  *  假设，当我们分析一个元素时，所有CSS规则已经收集完毕
  *  在真实浏览器中，可能遇到写在body的style标签，需要重新计算CSS的情况，这里我们忽略
  * 
  * 第三步：获取父元素序列
  *  在computeCSS函数中，我们必须知道元素的所有父元素才能判断元素与规则是否匹配
  *  我们上一步骤的stack，可以获取本元素所有的父元素
  *  因为我们首先获取的是“当前元素”，所以我们获得和计算父元素匹配的顺序是从内向外
  * 
  * 第四步：选择器与元素的匹配
  *  选择器也要从当前元素向外排列
  *  复杂选择器拆成针对单个元素的选择器，用循环匹配父元素队列
  * 
  * 第五步：计算选择器与元素匹配
  *  根据选择器的类型和元素属性，计算是否与当前元素匹配
  *  这里仅仅实现了三种基本选择器，实际的浏览器中药处理复合选择器
  *  作业（可选）：实现复合选择器，实现支持空格的Class选择器
  * 
  * 第六步：生成computed属性
  *  一旦选择匹配，就应用选择器到元素上，形成computedStyle
  * 
  * 第七步：specificity的计算逻辑
  *  css规则根据specificity和后来优先规则覆盖
  *  specificity是个四元组，越左边权重越高。specificity:【0，0，0，0】   ——>    [inline, id, class, tag]
  *  一个css规则的specificity根据包含的简单选择器相加而成
  */
