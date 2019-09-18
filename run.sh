#!/bin/sh
echo "104.18.18.18 free-ss.site" >>/etc/hosts
wget https://raw.githubusercontent.com/petronny/gfwlist2pac/master/gfwlist.pac -O /app/www/gfwlist.pac
wget https://free-ss.site/v/443.json -O /app/v2ray.json
sed -i "s/SOCKS5 127.0.0.1:1080/PROXY ${HTTP_PROXY}; SOCKS5 ${SOCKS5_PROXY}; DIRECT/g" /app/www/gfwlist.pac
nohup /app/v2ray/v2ray -config /app/v2ray.json > /dev/null 2>&1 &
nohup /app/proxy/proxy sps -S socks -T tcp -P 127.0.0.1:1080 -t tcp -p :8118 > /dev/null 2>&1 &
nohup /usr/sbin/mini_httpd -d /app/www/ > /dev/null 2>&1 &
/bin/sh

