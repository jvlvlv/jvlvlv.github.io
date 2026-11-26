在前几版代码中只归一化了error1，没有归一化error2，前面这部分是李书畅写的，我在这时才发现这个问题

```c
//归一化

void gui_yi_hua(void)
{
	float sum_temp1 = AD_Get[1] + AD_Get[0]/*, sum_temp2 = AD_Get[3] + AD_Get[2]*/;
if(fabs(sum_temp1)<0.01f) sum_temp1 = 0.01f;
//if(fabs(sum_temp2)<0.01f) sum_temp2 = 0.01f;
	error1=((AD_Get[1] - AD_Get[0])/sum_temp1)*100-pian1;//直行
	error2=/*((*/AD_Get[3] - AD_Get[2];//)/(sum_temp2))*100;//拐弯
}
```
于是我试着归一化了一下error2，但如李书畅所说，把error2归一化之后反而不如用电感值直接相减
虽然理论上来说归一化噪声更小更规范，但是俗话说能跑就不要动它，所以后面几版依然是error2无归一化
但我还是把归一化这版留下来了，因为我当时试了好久想把他归一化(；ω；)
```c
//归一化

void gui_yi_hua(void)
{
	float sum_temp1 = AD_Get[1] + AD_Get[0], sum_temp2 = AD_Get[3] + AD_Get[2],diff = AD_Get[3] - AD_Get[2];
	
	if(fabs(sum_temp1)<0.01f) sum_temp1 = 0.01f;
//if(fabs(sum_temp2)<0.01f) sum_temp2 = 0.01f;
	error1=((AD_Get[1] - AD_Get[0])/sum_temp1)*100-pian1;//直行
//	error2=/*((*/AD_Get[3] - AD_Get[2];//)/(sum_temp2))*100;//拐弯


if(sum_temp2 < 20.0f)
    error2 = diff;                         // 信号弱时直接用差值
else
    error2 = (diff / sum_temp2) * 100;           // 信号强时归一化

if(error2 >  100) error2 =  100;
if(error2 < -100) error2 = -100;
	
}
```
以上是失败的归一化error2代码
