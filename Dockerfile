FROM alpine

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories \
	&& apk update \
	&& apk add ca-certificates \
	&& apk add mini_httpd \
	&& rm -rf /var/cache/apk/* \
	&& mkdir -p /app/www \
	&& mkdir -p /app/proxy \
	&& mkdir -p /app/v2ray

#COPY ./proxy-linux-amd64.tar.gz /app/
#COPY ./v2ray-linux-64.zip /app/
COPY ./proxy /app/proxy
COPY ./v2ray /app/v2ray
COPY ./run.sh /app/

ENV HTTP_PROXY=127.0.0.1:8118
ENV SOCKS5_PROXY=127.0.0.1:1080
EXPOSE 80 1080 8118

ENTRYPOINT /app/run.sh

#RUN tar xpvf /app/proxy-linux-amd64.tar.gz -C /app/proxy/ \
#	&& unzip /app/v2ray-linux-64.zip -d /app/v2ray \
#	&& rm /app/proxy-linux-amd64.tar.gz \
#	&& rm /app/v2ray-linux-64.zip

