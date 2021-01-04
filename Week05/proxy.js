let activities = new Map()
    let callbacks = new Map()  // 用于存储对象和属性
    let usedReactivities = []
    function effect(callback) {
        // callbacks.push(callback)
        usedReactivities = []
        callback()  // 执行一下才知道依赖了哪些值
        console.log('usedReactivities', usedReactivities)
        for (let reactivity of usedReactivities) {
            if (!callbacks.has(reactivity[0])) {
                callbacks.set(reactivity[0], new Map())
            }
            let v = callbacks.get(reactivity[0])
            if (!v.has(reactivity[1])) {
                v.set(reactivity[1], [])
            }
            if (v.get(reactivity[1]).indexOf(callback) < 0) {
                v.get(reactivity[1]).push(callback)
            }
        }
    }

    function reactive(object) {
        // 为什么要缓存？
        if(activities.has(object)) {
            return activities.get(object)
        }
        let proxy = new Proxy(object, {
            get(obj, prop, value) {
                // console.log('***************get')
                // console.log('obj', obj)
                // console.log('prop', prop)
                // console.log('value', value)   // 会陷入死循环，导致内存溢出
                console.log('*** get ***', obj, prop)
                usedReactivities.push([obj, prop])
                if(typeof obj[prop] === 'object') {
                    return reactive(obj[prop])
                }
                return obj[prop]
            },
            set(obj, prop, value) {
                // console.log('***************set')
                // console.log('obj', obj)
                // console.log('prop', prop)
                // console.log('value', value)

                console.log('**** set ***', obj, prop)
                obj[prop] = value

                if (callbacks.has(obj)) {
                    let v = callbacks.get(obj)
                    if (v.has(prop)) {
                        let arr = v.get(prop)
                        for (let cb of arr) {
                            cb()
                        }
                    }
                }

                return obj[prop]
            }
        })
        activities.set(object, proxy)
        return proxy
    }

    let obj = {
        a: { b: 3 },
        b: 2
    }
    let po = reactive(obj)
    // console.log(po.a)

    effect(() => {
        console.log('依赖函数', po.a.b)
    })

    /**
     * reactive原理——proxy
     *  get：依赖收集
     *   如果使用了对象的某个属性，那么一定会调用get方法。那么，我们如何知道一个函数中是否使用了对象的某个属性呢？调用方法。
     *   effect方法，用来做依赖收集。
     *  set：动态更新
     *   如果外部对对象属性进行赋值，那么一定会调用set方法，那么可以根据收集到的依赖对其进行同步更新。
     */