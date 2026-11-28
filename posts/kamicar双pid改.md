这篇仔细说一下所谓的没有编码器但是双pid是什么东西

函数简介     双PD控制器计算函数，包含线性比例项+非线性比例项+微分项
参数说明     pd:双PD结构体指针; current_val:当前实际反馈值; target_val:目标设定值
返回参数     float          双PD控制器输出量
使用示例     output = DoublePD_Calc(&pd_track, error, 0);
备注信息     控制公式 output = error*kp1 + fabs(error)*error*kp2 + (error-last_error)*kd，自动更新上一次误差
函数简介     初始化双PD控制器参数，赋值kp1、kp2、kd并清零历史误差
参数说明     pd:双PD结构体指针; kp1:线性比例系数; kp2:非线性比例系数; kd:微分系数

这一版是张泓焘给的改法，把原本的双error改成了一个，kp从一个改为两个，分成线性比例项和非线性比例项，我就灵机一动把文件名命名为双pid，虽然现在看来双pid另有所指，这么写很不严谨而且很容易误解
但秉着纯复盘，记录学习过程的原则，还是把副标题命名为双pid

这次建议或许很关键？
至少后面都用的这个算法没有动过，但是后来车跑不好并不是pid参数的问题，甚至说kp上下浮动个4左右也差的不多，但他给我说肯定是参数的问题，我花了假期很久时间细致到0点几找合适的参数，导致我中秋后的全部国庆假期几乎都画在了这上面，而且毫无疑问0进展
这种毫无创造性可言的工作真的无聊透顶，再加上没有实际进展，导致我假期最后几天精神状态极其糟糕，最后调了一天出去超级大徒步逛青岛，拉了刘敬哲来干这种机械性工作

部分聊天记录：

直道用两个横电感，弯道用四个电感
取模值作为左右两边的值
左边＝根号下(左1平方加左2平方)
右边同理
pid控制算法改良一下
用双pd控制算法，公式为
(error×kp1)+error×error的绝对值×kp2+(当前error-上次error)×kd

**但是根本的根本还得是数据处理好**

首先学长的算法很有帮助  ~~其次大哥你太坑了根本不是数据的事~~

```c

//-------------------------------------------------------------------------------------------------------------------
// 函数简介     计算循迹误差error（直道只用两个横电感，弯道用四路电感）
// 参数说明     无
// 返回参数     float          滤波后的循迹误差值
// 使用示例     error = Error_Count();
// 备注信息     判断依据：左右横电感差值，差值小判定为直道；差值大判定为弯道，内部自带滑动平均滤波
//-------------------------------------------------------------------------------------------------------------------
float Error_Count(void)
{
    float diff = Adc_LEFT1_Value - Adc_RIGHT2_Value;
    float raw_err;
	  int ad_Sum=0;
	  ad_Sum=Adc_LEFT1_Value+Adc_RIGHT2_Value;
	
  if(ad_Sum>30)//边界保护，具体阈值自己测
	{
    if(fabs(diff) < 10.0f) //直道//具体阈值自己测
    {
        float sum_h = Adc_LEFT1_Value + Adc_RIGHT2_Value;
        if(sum_h < 0.01f) sum_h = 0.01f;
        raw_err = (Adc_LEFT1_Value - Adc_RIGHT2_Value) / sum_h;
    }
    else //弯道
    {
        float L = sqrt(Adc_LEFT1_Value*Adc_LEFT1_Value + Adc_LEFT2_Value*Adc_LEFT2_Value);
        float R = sqrt(Adc_RIGHT1_Value*Adc_RIGHT1_Value + Adc_RIGHT2_Value*Adc_RIGHT2_Value);
        float sum_LR = L + R;
        if(sum_LR < 0.01f) sum_LR = 0.01f;
        raw_err = (L - R) / sum_LR;
    }
    // 平均滑动滤波
    error = Error_SlideFilter(raw_err);
	}
    return error;
}
```
