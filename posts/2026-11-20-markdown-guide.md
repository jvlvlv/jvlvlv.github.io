这篇不是正式文章，是给你自己看的**语法速查**。写完第一篇之后可以删掉它（顺便从 `posts/index.json` 里删掉对应那一段）。

## 标题

用 `## 二级标题` 到 `#### 四级标题`，一级标题 `#` 留给文章标题，正文里别用。

## 强调

**粗体用两个星号**，*斜体用一个星号*，~~删除线用两个波浪号~~，行内代码写成 `int16_t adc_value;`。

## 列表

- 无序列表用减号
- 第二项，可以换行继续写同一项的内容
- 第三项

1. 有序列表用数字加点
2. 第二步
3. 第三步

## 引用

> 舵机中值不是调出来的，是撞出来的。
>
> —— 某位学长的原话

## 代码

行内的像这样 `PID_Calc(&motor, target, actual);`，整段代码用三个反引号包起来，最好标上语言：

```c
// 增量式 PID，比赛时最常用的那一版
float pid_calc(pid_t *p, float target, float actual)
{
    float err = target - actual;
    p->integral += err;
    return p->kp * err
         + p->ki * p->integral
         + p->kd * (err - p->last_err);
}
```

```python
# 处理一圈的数据，看看哪里打滑了
import numpy as np
speed = np.loadtxt("run_03.csv", delimiter=",")
print("最大偏差:", np.abs(speed - speed.mean()).max())
```

## 表格

| 参数 | 初值 | 调完之后 | 备注 |
|------|------|----------|------|
| KP | 12.0 | 18.5 | 直道更稳 |
| KI | 0.0 | 0.3 | 消除静差 |
| KD | 3.0 | 1.5 | 弯道不抖 |

## 图片

单独一行放图片，会自动居中并加圆角。点一下能看大图。

![小车传感器布局示意](images/example.svg)

图片文件放到 `images/` 目录，路径写相对路径就行。

## 视频

比赛视频别直接往 GitHub 传（仓库会变巨大），先传到 B 站，然后在文章里单独一行写 `@bilibili BV1xxxxxxxxx`，
这一行会被换成 16:9 的播放器。贴完整链接也行：`@bilibili https://www.bilibili.com/video/BV1xxxxxxxxx`。

## 分隔线

---

差不多就这些。剩下的（比如嵌套列表、脚注）这个渲染器没做，写博客也用不上。
