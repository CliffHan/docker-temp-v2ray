本项目用于临时性质的科学上网，依赖于以下工程和服务：

* [v2ray](https://github.com/v2ray/v2ray-core/releases)
* [free-ss.site](https://free-ss.site)
* [goproxy](https://github.com/snail007/goproxy/releases)
* gfwlist2pac
* mini_httpd
* alpine
* docker

编译方法：

```shell
# 下载v2ray和goproxy，也可自行下载并解压到预设目录
./init.sh
# 使用docker编译
docker build -t alpine-temp-proxy .
```

编译结果是一个Docker image，适用于linux-amd64。

使用方法：

1. 环境变量，HTTP_PROXY和SOCKS5_PROXY是用在pac中的，如果不用自动配置可以不设。需要自动配置的话，根据自己的环境设置
2. 端口映射，80端口对应pac服务，pac地址是http://127.0.0.1/gfwlist.pac；8118端口对应http proxy，1080端口对应socks5 proxy
3. Docker每次重新启动时，会更新gfwlist.pac和服务器配置，因此如果proxy不可用，则可以重启一次再看

==========分隔线==========

在windows或linux环境下，在没有科学上网环境的情况下，可以按照以下步骤操作：

1. 修改本机hosts  
   windows下，通常是C:\Windows\System32\drivers\etc\hosts  
   Linux下，通常是/etc/hosts  
   用管理员或root权限打开后，增加下面这句：  
   104.18.18.18 free-ss.site
2. 下载[v2ray](https://github.com/v2ray/v2ray-core/releases)的对应版本
3. 浏览器打开https://free-ss.site，直接下载第一个表的第一行最右边的文件，是一个config.json文件
4. 将这个config.json文件放到v2ray目录，覆盖原始文件
5. 运行v2ray，Windows下也可以运行wv2ray，即在后台运行的v2ray

如果一切正常，你已经拥有一个本地运行的socks5代理，监听1080端口。

下一步可以考虑使用SwitchyOmega之类插件做选择性科学上网。

==========分隔线==========

sscrawler.js和package.json是使用node.js抓取免费v2ray服务的工具
使用前需要将在本地hosts中增加下面几句，以保证域名正确：
104.18.18.18 free-ss.site
104.31.74.55 youneed.win
104.31.74.55 www.youneed.win

使用方法，在同目录下执行：
npm install
node sscrawler.js
