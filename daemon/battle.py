import os
import json
import time
import shutil
import tempfile
import subprocess
from os import path

import const

class Battle:
    FNULL = open(os.devnull, 'wb')

    def __init__(self, server, ai0, ai1):
        self.server = server
        self.ai0 = ai0
        self.ai1 = ai1

    def _prepareBattle(self):
        print '      Copying...'

        self.tmpdir = tempfile.mkdtemp()
        # Copy Server
        shutil.copytree(self.server, path.join(self.tmpdir, 'server'))
        # Copy Clients
        shutil.copy(self.ai0['absPath'], path.join(self.tmpdir, 'ai0'))
        shutil.copy(self.ai1['absPath'], path.join(self.tmpdir, 'ai1'))

    def _runProgram(self, args):
        time.sleep(1)
        return subprocess.Popen(args, stdin=Battle.FNULL, stdout=Battle.FNULL, stderr=Battle.FNULL, cwd=self.tmpdir, env={'PATH':self.tmpdir})

    def _runBattle(self):
        time.sleep(5)
        # Run Server and Clients
        print '      Running Server...'
        server = self._runProgram([path.join(self.tmpdir, 'server', 'main.py'), 'p2dv'])
        print '      Running AI 0...'
        client0 = self._runProgram([path.join(self.tmpdir, 'ai0'), '127.0.0.1'])
        print '      Running AI 1...'
        client1 = self._runProgram([path.join(self.tmpdir, 'ai1'), '127.0.0.1'])

        # Wait for server, then kill clients
        server.wait()
        client0.kill()
        client1.kill()

    def _clean(self):
        shutil.rmtree(self.tmpdir)

    def _readJSON(self):
        data = open(path.join(self.tmpdir, 'json.log')).read()
        self.json = json.loads(data)

    def Run(self):
        self._prepareBattle()
        self._runBattle()
        self._readJSON()
        self._clean()
        return self.json
