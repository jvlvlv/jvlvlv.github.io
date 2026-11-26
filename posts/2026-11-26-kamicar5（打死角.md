这一版的思路由孙一乐提供
这也是最后没有用到的一版代码，准确说是连烧录都没烧录过的一版，因为在我写完还没有烧录的之前李书畅的代码让车变的大幅稳定，高兴之余没有再去烧录这版，而是直接以他的代码（也就是下一版）为底子修改
对于我们小车转弯力度不够的问题，孙一乐提到可以尝试打死角的思路，也就是检测到error值给一个固定的打角
```c

    if(hard_turn)
    {
        if(error > 0)   // 左转急弯：左内反转，右外加速
        {
            *out_L = HARD_INNER_SPEED;
            *out_R = HARD_OUTER_SPEED;
        }
        else            // 右转急弯：右内反转，左外加速
        {
            *out_L = HARD_OUTER_SPEED;
            *out_R = HARD_INNER_SPEED;
        }

        if(*out_L > OUT_MAX) *out_L = OUT_MAX;
        if(*out_L < OUT_MIN) *out_L = OUT_MIN;
        if(*out_R > OUT_MAX) *out_R = OUT_MAX;
        if(*out_R < OUT_MIN) *out_R = OUT_MIN;

        old_error = error;
        return;
    }

    /* ---- 正常非线性 PD ----
     * out = error*Kp1 + |error|*error*Kp2 + (error-old_error)*Kd
     * 小误差时 Kp1 主导（直道稳），大误差时 Kp2 主导（弯道猛）
     */
    out_diff = error * Kp_L_big
             + fabs(error) * error * Kp2
             + (error - old_error) * Kd_L;
```
而且从这版开始error不在分1 2
虽然我记得应该是下一版才合并error，但文件不会骗人，这一版就只用了一个error
那就把这一版的error计算也贴一下，果然变了很多
用了新的误差计算：加权差比和 + 死区 + 滤波
```c
void gui_yi_hua(void)
{
    float L_h, R_h, L_v, R_v;
    float sum_h, sum_v;
    float err_h, err_mod;
    float L_mod, R_mod, sum_mod;
    float w;
    float raw_err;

    L_h = AD_Get[0];  /* 左横 */
    R_h = AD_Get[1];  /* 右横 */
    L_v = AD_Get[2];  /* 左竖 */
    R_v = AD_Get[3];  /* 右竖 */

    sum_h = L_h + R_h;
    sum_v = L_v + R_v;

    /* 信号太弱时直接返回，避免无意义计算 */
    if (sum_h + sum_v < 20.0f)
    {
        return;
    }

    /* 防止分母为 0 */
    if (sum_h < 1.0f) sum_h = 1.0f;
    if (sum_v < 1.0f) sum_v = 1.0f;

    /* 1. 水平差比和 */
    err_h = (L_h - R_h) / sum_h * 100.0f;

    /* 2. 四电感模差比和 */
    L_mod = sqrt(L_h * L_h + L_v * L_v);
    R_mod = sqrt(R_h * R_h + R_v * R_v);
    sum_mod = L_mod + R_mod;
    if (sum_mod < 0.01f) sum_mod = 0.01f;
    err_mod = (L_mod - R_mod) / sum_mod * 100.0f;

    /* 3. 根据竖直电感强度计算权重（竖直越大，越偏向弯道）
     *    权重 w 范围 0~1，50.0f 是半权重点，可根据赛道调整
     */
    w = sum_v / (sum_v + 50.0f);
    if (w > 1.0f) w = 1.0f;

    /* 4. 平滑融合 */
    raw_err = err_h * (1.0f - w) + err_mod * w;

    /* 5. 零点补偿（根据你的安装调整，原为 -7） */
    raw_err = raw_err - error_offset;

    /* 6. 死区：小误差直接置零，抑制直线抖动
     *    不用 fabs，直接范围比较，避免 C51 库问题
     */
    if (raw_err < 3.0f && raw_err > -3.0f)
    {
        raw_err = 0.0f;
    }

    /* 7. 滑动平均滤波（保留原有） */
    error = Error_SlideFilter(raw_err);


    /* 8. 一阶低通（可选） */
    {
        static float error_last = 0;
        error = error_last * 0.7 + error * 0.3;
        error_last = error;
    }
```
11-27补充：
看了眼文件时间，有好几个个kamicar5，这是最后一版kamicar5，所以看起来改动这么多，合并为一个error就是在前面的版本，不过这版既然已经编辑好了就不额外多写一篇了
