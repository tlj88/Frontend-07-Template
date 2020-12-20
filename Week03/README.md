# 学习笔记

## js中的正则
### RegExp
```javascript
    let regexp = /[0-9]*/
    // 或者
    let regexp = new RegExp('[0-9]*')
```
方法   
-**exec**   
入参：字符串；   
出参：数组，其中存放匹配的结果；如果未匹配到，则返回null；  
 
例子🌰：
```javascript
    let regexp = /([0-9\.]+)|([ \t]+)|([\r\n]+)|(\+)|(\-)|(\*)|(\/)/g
    let str = '1024 + 10 * 25'
    regexp.exec(str)
```

说明：   

    exec如果找到了匹配的文本，则返回一个结果数组；否则，返回null。 

    结果数组的第0个元素是与正则表达式相匹配的文本；第1个元素是与RegExpObject的第1个子表达式相匹配的文本（如果有的话），第2个元素是与RegExpObject的第2个子表达式相匹配的文本（如果有的话），以此类推。

    除了数组元素和length属性之外，数组还有两个属性：index属性声明的是匹配文本的第一个字符的位置；input属性则存放的是被检索的字符串string。   

    当RegExpObject是一个非全局正则表达式时，exec方法返回的数组与调用String.match方法返回的数组是相同的。
    当是一个全局正则表达式时，它会在RegExpObject的**lastIndex属性指定的字符处开始检索字符串string**。当exec找到了与表达式相匹配的文本时，在匹配后，它会将RegExpObject的**lastIndex属性设置为匹配文本的最后一个字符的下一个位置**。这就是说，可以通过反复调用exec方法来遍历字符串中的所有匹配文本。当exec再也找不到匹配的文本时，它将返回null，并把lastIndex属性重置为0。

注意：   

    如果在一个字符串中完成了一次模式匹配之后要开始检索新的字符串，就必须手动地把lastIndex属性重置为0。



-**test**   
入参：字符串   
出参：true / false 

用于测试字符串参数中是否存在匹配正则表达式模式的字符串。   
  
例子🌰
```javascript
    RegExp.prototype.test(str)
```

说明：
    
    当RegExpObject是一个非全局正则表达式时，test方法始终从字符串的开头开始匹配；

    当RegExpObject是一个全局正则表达式时，test方法会从lastIndex的值的位置开始匹配；


### 字符串
方法
-**search**
入参：正则 / 字符串，字符串会隐式地转成正则   
出参：第一个匹配结果的index，否则返回-1

* 用于检索字符串中指定的子字符串，或检索与正则表达式相匹配的子字符串
* 方法返回第一个匹配结果index，查找不到则返回-1
* 方法**不执行全局匹配**，它将忽略标志g，并且总是从字符串的开始进行检索

例子🌰
```javascript
    String.prototype.search(reg)
```

-**match**
入参：正则 / 字符串
出参：数组，其中存放匹配的结果；如果未匹配到，则返回null； 

说明：

    当正则表达式是一个非全局正则时，

    当正则表达式时一个全局正则时，
    

-**split**

-**replace**



## LL算法