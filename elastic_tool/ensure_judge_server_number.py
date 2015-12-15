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

def deploy_servers(count):
    new_servers = set()
    for i in range(count):
        new_server = vultr.server_create()
        new_servers.add(new_server['SUBID'])
    while True:
        finish = True
        table = [['SUBID', 'IP', 'STATUS']]
        current_servers = get_current_servers()
        for k in new_servers:
            if k in current_servers:
                ip = current_servers[k]['main_ip']
                status = current_servers[k]['status']
            else:
                ip = 'unknown'
                status = 'unknown'
            table.append([k, ip, status])
            if status != 'active':
                finish = False
        print(tabulate(table, headers='firstrow'))
        print('')
        if finish:
            break
        time.sleep(1)

def send_quit(ip):
    cmd = 'kill -s QUIT $(/home/p2dv/sjtu.cool/daemon/poll_status.sh)'
    subprocess.call(['ssh', 'p2dv@%s'%ip, cmd])

def poll_daemon(ip):
    cmd = '/home/p2dv/sjtu.cool/daemon/poll_status.sh'
    res = subprocess.check_output(['ssh', 'p2dv@%s'%ip, cmd])
    return str(res, 'utf-8').strip()

def destroy_servers(count):
    old = get_current_servers()
    target = set(list(old.keys())[:count])
    for k in target:
        ip = old[k]['main_ip']
        print('sending SIGQUIT to %s...' % ip)
        send_quit(ip)
    while True:
        finish = True
        table = [['SUBID', 'IP', 'STATUS']]
        current = get_current_servers()
        for k in target:
            ip = old[k]['main_ip']
            if k not in current:
                status = 'destroyed'
            else:
                finish = False
                status = current[k]['status']
                if status == 'active':
                    if poll_daemon(ip) != 'DOWN':
                        status = 'judging'
                    else:
                        status = 'idle'
                        vultr.server_destroy(k)
            table.append([k, ip, status])
        if finish:
            break
        time.sleep(1)

def main():
    if len(sys.argv) != 2:
        print('usage: ./ensure_judge_server_number.py <the number of servers>')
        sys.exit(1)

    target_number = int(sys.argv[1])
    target_number = max(0, target_number)
    target_number = min(VULTR['MAX_SERVER'], target_number)

    print('target number: %d' % target_number)
    current_servers = get_current_servers()
    print('# of judge servers on Vultr: %d' % len(current_servers))

    if len(current_servers) < target_number:
        deploy_servers(target_number - len(current_servers))
    elif len(current_servers) > target_number:
        destroy_servers(len(current_servers) - target_number)

    print('Done')

main()