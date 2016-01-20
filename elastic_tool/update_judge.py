#!/usr/bin/env python3

import sys
import time
import subprocess
from tabulate import tabulate

import vultr
from const import VULTR
from pprint import pprint

def get_current_servers():
    vultr_list = vultr.server_list()
    return { k: v for k, v in vultr_list.items() if v['label'] == 'judge' }

def send_git_pull(ip):
    cmd = 'cd /home/p2dv/ACM-2015-AI-Server; git pull;'
    subprocess.call(['ssh', '-o', 'StrictHostKeyChecking no', 'p2dv@%s'%ip, cmd])

def update_judge():
    servers = get_current_servers()
    for k, v in servers.items():
        ip = v['main_ip']
        print('sending git pull to %s...' % ip)
        send_git_pull(ip)

def main():
    update_judge()
    print('Done')

main()