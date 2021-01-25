// js中的有限状态机（Mealy）

// 每个函数是一个状态
function state(input) { // 函数参数就是输入
    ......  // 在函数中，可以自由地编写代码，处理每个状态的逻辑

    return next // 返回值为下一个状态
}

while(input) {
    // 获取输入
    state = state(input)    // 把状态机的返回值作为下一个状态
}