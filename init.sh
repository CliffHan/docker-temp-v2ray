#!/bin/bash
#wget https://github.com/v2ray/v2ray-core/releases/download/v4.20.0/v2ray-linux-64.zip -O ./v2ray-linux-64.zip
#wget https://github.com/snail007/goproxy/releases/download/v8.2/proxy-linux-amd64.tar.gz -O ./proxy-linux-amd64.tar.gz
mkdir -p ./v2ray
mkdir -p ./proxy
tar xpvf ./proxy-linux-amd64.tar.gz -C ./proxy
unzip ./v2ray-linux-64.zip -d ./v2ray

