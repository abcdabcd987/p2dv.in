import os
import json
import time
import shutil
import tempfile
import subprocess32
from os import path

import const

class Battle:
    FNULL = open(os.devnull, 'wb')

    def __init__(self, server, ai0, ai1, updater):
        self.server = server
        self.ai0 = ai0
        self.ai1 = ai1
        self.updater = updater

    def _prepareBattle(self):
        print '      Copying...'

        self.tmpdir = tempfile.mkdtemp()
        # Copy Server
        shutil.copytree(self.server, path.join(self.tmpdir, 'server'))
        # Copy Clients
        shutil.copy(self.ai0['absPath'], path.join(self.tmpdir, 'ai0'))
        shutil.copy(self.ai1['absPath'], path.join(self.tmpdir, 'ai1'))

    def _runProgram(self, args, stdin=FNULL, stdout=FNULL, stderr=FNULL):
        return subprocess32.Popen(args, stdin=stdin, stdout=stdout, stderr=stderr, cwd=self.tmpdir, env={'PATH':self.tmpdir})

    def _runBattle(self):
        # Run Server and Clients
        print '      Running Server ... ',
        server = self._runProgram([path.join(self.tmpdir, 'server', 'main.py'), 'p2dv'], stdin=subprocess32.PIPE, stderr=subprocess32.PIPE)
        print 'Done'
        
        print '      Getting Port ... ',
        server.stdin.write('get port\n')
        server.stdin.flush()
        port = server.stderr.readline().strip()
        print port

        print '      Running AI 0 ... ',
        server.stdin.write('accept ai0\n')
        server.stdin.flush()
        client0 = self._runProgram([path.join(self.tmpdir, 'ai0'), 'localhost', port], stderr=subprocess32.PIPE)
        self.ai0name = server.stderr.readline().strip()
        print 'Done. Name: ', self.ai0name

        print '      Running AI 1 ... ',
        server.stdin.write('accept ai1\n')
        server.stdin.flush()
        client1 = self._runProgram([path.join(self.tmpdir, 'ai1'), 'localhost', port], stderr=subprocess32.PIPE)
        self.ai1name = server.stderr.readline().strip()
        print 'Done. Name: ', self.ai1name

        server.stdin.write('play\n')
        server.stdin.flush()
        line = server.stderr.readline()
        if line != 'ready\n':
            print 'not get ready signal, but:', line

        # Wait for server
        while True:
            server.stdin.write('get steps\n')
            server.stdin.flush()
            steps = server.stderr.readline().strip()
            if steps == 'finished':
                break
            self.updater(steps)

        # Get stderr
        try:
            self.stderr0 = client0.communicate(timeout=1)[1]
        except:
            client0.kill()
            self.stderr0 = client0.communicate()[1]

        try:
            self.stderr1 = client1.communicate(timeout=1)[1]
        except:
            client1.kill()
            self.stderr1 = client1.communicate()[1]

        # Kill all
        if server.poll() == None:
            server.kill()
        if client0.poll() == None:
            client0.kill()
        if client1.poll() == None:
            client1.kill()

    def _clean(self):
        shutil.rmtree(self.tmpdir)
        pass

    def _readJSON(self):
        data = open(path.join(self.tmpdir, 'json.log')).read()
        self.json = json.loads(data)

    def Run(self):
        time.sleep(1)
        self._prepareBattle()
        self._runBattle()
        self._readJSON()
        self._clean()
        return self.json, self.stderr0, self.stderr1
