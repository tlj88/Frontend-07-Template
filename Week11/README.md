# 学习笔记

## 思考题
为什么 first-letter 可以设置 float 之类的，而 first-line 不行呢？
答：first-line是渲染后的首行，如果支持float，需要进行两次布局，影响性能；first-letter就是针对源码中的首个字符，这是客观的，不需要进行通过布局来确认。