#!/bin/sh

ip=$(ip addr | grep 'state UP' -A2 | tail -n1 | awk '{print $2}' | cut -f1  -d'/')
sed -i "s/SERVER_NAME.*$/SERVER_NAME='$ip'/g" /home/p2dv/sjtu.cool/daemon/const.py