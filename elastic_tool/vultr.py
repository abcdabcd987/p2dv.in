import sys
import requests
from traceback import format_exception

from const import VULTR

def gen_url(api):
    return '%s%s?api_key=%s' % (VULTR['API_ROOT'], api, VULTR['API_KEY'])

def ensure(f):
    def wrap(*args, **kwargs):
        while True:
            try:
                return f(*args, **kwargs)
            except:
                etype, value, tb = sys.exc_info()
                print(''.join(format_exception(etype, value, tb)))
    return wrap

@ensure
def server_list():
    url = gen_url('/v1/server/list')
    r = requests.get(url, timeout=5)
    if r.status_code != 200:
        raise Exception("status_code error: %d, respond_body: %s" % (r.status_code, r.text))
    return r.json()

@ensure
def server_create():
    url = gen_url('/v1/server/create')
    body = { 'DCID': 12, 'OSID': 164, 'VPSPLANID': 29, 'SNAPSHOTID': VULTR['SNAPSHOTID'], 'label': 'judge' }
    r = requests.post(url, data=body, timeout=5)
    if r.status_code != 200:
        raise Exception("status_code error: %d, respond_body: %s" % (r.status_code, r.text))
    return r.json()

@ensure
def server_destroy(subid):
    url = gen_url('/v1/server/destroy')
    body = { 'SUBID': subid }
    r = requests.post(url, data=body, timeout=5)
    return r.status_code