FROM haproxy:2.7.1-alpine3.17

USER root

RUN apk add --update socat

COPY haproxy.cfg /usr/local/etc/haproxy/haproxy.cfg
