# POE 流放之路网页市集插件

一些小功能整合了一下，后续有新的会持续添加
> 没加载出来的话刷新一下页面
> `jsdelivr`好像有点抽，实在加载不出来可以去源码替换这个地址

## 目前功能

-   翻译物品，调用大佬的[cn-poe-translator](https://github.com/cn-poe-community/cn-poe-translator)实现
-   快速搜索
-   大星团天赋位置标注(实验)

### 翻译物品

物品下方增加`复制英文`按钮，点击即可复制翻译过后的物品信息  
可以直接在国际版 pob 粘贴创建物品，复制出来的未翻译的交易信息和其它描述信息不会影响
![复制英文](https://img2.imgtp.com/2024/04/13/uZA9k7V7.png)

页面底部增加`显示翻译页面按钮`, 可以复制游戏内物品在此处翻译

### 快速搜索

**数据存储在`localStorage`里， 清除浏览器数据的时候注意备份**

点击快速搜索即跳转到对应搜索条件勾选的界面

> 具体的数值和物品信息手动填写

支持自定义功能  
单个的：填上名字和查询字符保存就行  

批量导入的格式是:
```json
[
    {
        "label": "8天赋星团",
        "value": "nw0p9VS0" // 链接后面的搜索参数
    },
    {
        "label": "21/20技能",
        "value": "Nkz0F5" // 链接后面的搜索参数
    },
]
```
批量导入时`lable`和`value`完全相同的项会去重  


### 大星团天赋位置标注(实验)

**实验中，不保证内容准确(试了一些好像没问题)。有问题请反馈**

向搜索结果里面，带天赋的`大星团珠宝`下方增加`查看天赋位置`功能

具体效果:
![效果](https://img2.imgtp.com/2024/04/13/ZOwwbCkz.gif)  

> 找到的说法是按数据库里天赋列表从上到下的顺序，顺时针排列。看起来也是这样的。



##### 以上 ~

[github](https://github.com/Rxdey/poe-trade-plugin)
