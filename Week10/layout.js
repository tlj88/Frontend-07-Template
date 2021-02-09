



/**
 * 排版  flex布局
 * @param {*} element 
 */
function layout(element) {
    if(!element.computedStyle) {
        return
    }
    let elementStyle = getStyle(element)    // 进行预处理
    
    if(elementStype.display !== 'flex'){
        return
    }

    let items = element.children.filter(e => e.type === 'element')
    // 这个步骤不太明白
    // 为了支持元素的order属性，应该就是flex布局中的order属性
    items.sort(function(a, b) {
        return (a.order || 0) - (b.order || 0)
    })

    let style = elementStyle;

    ['width', 'height'].forEach(size => {
        if(style[size] === 'auto' || style[size] === ''){
            style[size] = null
        }
    })

    if(!style.flexDirection || style.flexDirection === 'auto') {
        style.flexDirection = 'row'
    }
    if(!style.alignItems || style.alignItems === 'auto') {
        style.alignItems = 'stretch'
    }
    if(!style.justifyContent || style.justifyContent === 'auto') {
        style.justifyContent = 'flex-start'
    }
    if(!style.flexWrap || !style.flexWrap === 'auto') {
        style.flexWrap = 'nowrap'
    }
    if(!style.alignContent || style.alignContent === 'auto') {
        style.alignContent = 'stretch'
    }

    let mainSize, mainStart, mainEnd, mainSign, mainBase,
        crossSize, crossStart, crossEnd, crossSign, crossBase
    if(style.flexDirection === 'row') {
        mainSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        mainSign = +1
        mainBase = 0

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if(style.flexDirection === 'row-reverse') {
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase = style.width

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if(style.flexDirection === 'column') {
        mainSize = 'height'
        mainStart = 'top'
        mainEnd = 'bottom'
        mainSign = +1
        mainBase = 0

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if(style.flexDirection === 'column-reverse') {
        mainSize = 'height'
        mainStart = 'bottom'
        mainEnd = 'top'
        mainSign = -1
        mainBase = style.height

        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if(style.flexWrap === 'wrap-reverse') {
        let tmp = crossStart
        crossStart = crossEnd
        crossEnd = tmp
        crossSign = -1     
        // TODO 没有crossBase吗？
        // 后续再判断？
        crossBase = style[crossSize]
    } else {
        crossBase = 0
        crossSign = +1
    }


    let isAutoMainSize = false
    if(!style[mainSize]) {
        elementStype[mainSize] = 0
        for(var i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)  // TODO 老师代码中没写这行
            if(itemStyle[mainSize] !== null || itemStyle[mainSize] !== (void 0)) {
                elementStyle[mainSize] = elementStyle[mainSize] + itemStyle[mainSize]
            }
        }
        isAutoMainSize = true
    }


    let flexLine = []
    let flexLines = [flexLine]
    
    let mainSpace = elementStyle[mainSize]
    let crossSpace = 0
    /********************  元素分行 *******************/
    for(let i = 0; i < items.length; i++) {
        let item = items[i]
        let itemStyle = getStyle(item)

        if(itemStyle[mainSize] === null) {
            itemStyle[mainSize] = 0
        }

        if(itemStyle.flex) {
            flexLine.push(item)
        } else if(style.flexWrap === 'nowrap' && isAutoMainSize) {
            mainSpace -= itemStyle[mainSize]
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            }
            flexLine.push(item)
        } else {
            if(itemStyle[mainSize] > style[mainSize]) {  // 这块似乎和真实的css渲染不同，真实渲染不会将子元素的宽度强制设置为父元素的宽度
                itemStyle[mainSize] = style[mainSize]
            }
            if(mainSpace < itemStyle[mainSize]) {
                flexLine.mainSpace = mainSpace      // 主轴上的剩余空间
                flexLine.crossSpace = crossSpace    // 交叉轴的高度
                flexLine = [item]
                flexLines.push(flexLine)
                mainSpace = style[mainSpace]
                crossSpace = 0
            } else {
                flexLine.push(item)
            }
            if(itemStyle[crossSize] !== null && itemStyle[crossSize] !== (void 0)) {
                crossSpace = Math.max(crossSpace, itemStyle[crossSize])
            }
            mainSpace -= itemStyle[mainSize]
        }
    }
    flexLine.mainSpace = mainSpace

    if(style.flexWrap === 'nowrap' || isAutoMainSize) {
        flexLine.crossSpace = style[crossSize] !== (void 0) ? style[crossSize] : crossSpace
    } else {
        flexLine.crossSpace = crossSpace
    }

    /********************  计算主轴  **********************/
    // mainSpace < 0 只在单行的情况下会出现
    if(mainSpace < 0) {
        let scale = style[mainSize] / (style[mainSize - mainSpace])
        let currentMain = mainBase
        for(let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)
            if(itemStyle.flex) {
                itemStyle[mainSize] = 0
            }

            itemStyle[mainSize] = itemStyle[mainSize] * scale   // TODO 不用处理小数的情况吗？

            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
            currentMain = itemStyle[mainEnd]     // TODO 难道不会重叠
        }
    } else {
        flexLines.forEach(items => {
            let mainSpace = items.mainSpace
            let flexTotal = 0
            for(let i = 0; i < items.length; i++) {
                let item = items[i]
                let itemStyle = getStyle(item)

                if((itemStyle.flex !== null) && (itemStyle.flex !== (void 0))) {
                    flexTotal += itemStyle.flex
                    continue
                }
            }
            // 子元素的flex属性有值
            if(flexTotal > 0) {
                let currentMain = mainBase
                for(let i = 0; i < items.length; i++) {
                    let item = items[i]
                    let itemStyle = getStyle(item)

                    if(itemStyle.flex) {
                        itemStyle[mainSize] = itemStyle[mainSize] + (mainSpace / flexTotal) * itemStyle.flex  // TODO 老师代码中没有加上itemStyle[mainSize]
                    }
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd]
                }
            } else {
                let step = 0
                let currentMain = mainBase
                if(style.justifyContent === 'flex-start') {
                    currentMain = mainBase
                    step = 0
                } else if(style.justifyContent === 'flex-end') {
                    currentMain = mainSpace * mainSign + mainBase
                    step = 0
                } else if(style.justifyContent === 'center') {
                    currentMain = mainSpace / 2 * mainSign + mainBase
                    step = 0
                } else if(style.justifyContent === 'space-between') {
                    currentMain = mainBase
                    step = mainSpace / (items.lenght - 1) * mainSign
                } else if(style.justifyContent === 'space-around') {
                    step = mainSpace / items.length * mainSign
                    currentMain = step / 2 + mainBase
                }

                for(let i = 0; i < items.length; i++) {
                    let item = items[i]
                    let itemStyle = getStyle(item)
                    itemStyle[mainStart] = currentMain   // TODO 老师代码中写的好像不对
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign * itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd] + step
                }
            }
        })
    }

    /******************  计算交叉轴 *******************/
    // 计算交叉轴 align-items align-self
    let crossSpace      // 父元素剩余的高度
    if(!style[crossSize]) {     // auto size
        crossSpace = 0
        elementStyle[crossSize] = 0
        for(let i = 0; i < flexLines.length; i++) {
            elementStyle[crossSize] = elementStyle[crossSize] + flexLines[i].crossSpace
        }
        // TODO 不计算元素的crossStart和crossEnd吗
    } else {
        crossSpace = style[crossSize]
        for(let i = 0; i < flexLines; i++) {
            crossSpace -= flexLines[i].crossSpace
        }
    }

    let lineSize = style[crossSize] / flexLines.length   // TODO 不是每行的高度都一致的吧
    let step
    if(style.alignContent === 'flex-start') {
        crossBase = 0
        step = 0
    }
    if(style.alignContent === 'flex-end') {
        crossBase += crossSign * crossSpace
        step = 0
    }
    if(style.alignContent === 'center') {
        crossBase += crossSign * crossSpace / 2
        step = 0
    }
    if(style.alignContent === 'space-between') {
        crossBase = 0
        step = crossSpace / (flexLines.length - 1)
    }
    if(style.alignContent === 'space-around') {
        step = crossSpace / flexLines.length
        crossBase += crossSign * step / 2
    }
    if(style.alignContent === 'stretch') {
        crossBase = 0
        step = 0
    }
    flexLines.forEach((items) => {
        let lineCrossSize = style.alignContent === 'stretch' ?
            items.crossSpace + crossSpace / flexLines.length :
            items.crossSpace

        for(let i = 0; i < items.length; i++) {
            let item = items[i]
            let itemStyle = getStyle(item)

            let align = itemStyle.alignSelf || style.alignItems
            
            if(itemStyle[crossSize] === null) {    // stretch在height=0时生效，真实情况下应该还要搭配alignContent：stretch使用
                itemStyle[crossSize] = (align === 'stretch') ? lineCrossSize : 0
            }

            if(align === 'flex-start') {
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]
            }

            if(align === 'flex-end') {   // TODO 这块不太明白
                itemStyle[crossEnd] = crossBase + crossSign * lineCrossSize
                itemStyle[crossStart] = itemStyle[crossEnd] - crossSign * itemStyle[crossSize]
            }

            if(align === 'center') {
                itemStyle[crossStart] = crossBase + crossSign * (lineCrossSize - itemStyle[crossSize]) / 2
                itemStyle[crossEnd] = itemStyle[crossStart] + crossSign * itemStyle[crossSize]      // TOOD 待确认
            }

            if(align === 'stretch') {
                itemStyle[crossStart] = crossBase
                itemStyle[crossEnd] = crossBase + crossSign * ((itemStyle[crossSize] !== null && itemStyle[crossSize] !== void 0) ? itemStyle[crossSize] : lineCrossSize) // TODO 待确认
                itemStyle[crossSize] = crossSign * (itemStyle[crossEnd] - itemStyle[crossStart])
            }
        }
        crossBase += crossSign * (lineCrossSize + step)
    })
    console.log(items)

}

// 对样式进行预处理
function getStyle(element) {
    if(!element.style) {
        element.style = {}
    }

    for(let prop in element.computedStyle) {
        let p = element.computedStyle.value
        element.style[prop] = element.computedStyle[prop].value

        if(element.style[prop].toString().match(/px$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
        if(element.style[prop].toString().match(/^[0-9\.]+$/)) {
            element.style[prop] = parseInt(element.style[prop])
        }
    }

    return element.style
}




/**
 * 分行
 *  根据主轴尺寸，把元素分进行
 *  若设置了no-wrap，则强行分配进第一行
 */

/**
 * 计算主轴方向
 *  找出所有flex元素
 *  把主轴方向的剩余尺寸按比例分配给这些元素
 *  若剩余空间为负数，所有flex元素宽度置为0，等比压缩剩余元素
 */

/**
 * 计算交叉轴方向
 *  根据每一行中最大元素尺寸计算行高
 *  根据行高flex-align和item-align，确定元素具体位置
 */

/**
 * 总结
 */

/**
 * render总结
 *  绘制需要依赖一个图形环境，我们这里采用了npm包images
 *  绘制在一个viewport上进行
 *  与绘制相关的属性：background-color、border、background-image等
 */

// 当剩余的空间是负数的时候，nowrap情况下，所有的flex元素宽度设为0，其余元素等比压缩    TODO 似乎和css表现不一致