#!/bin/bash
timedatectl set-timezone Asia/Shanghai
yum makecache
yum install -y git epel-release boost-devel gcc python-devel
yum group install -y "Development Tools"
easy_install pymongo
easy_install subprocess32
easy_install tornado
useradd -m -s /bin/bash p2dv
passwd p2dv
