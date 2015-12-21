# -*- coding: utf-8 -*-
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

    def __init__(self, judge, ai0, ai1, updater, uploader):
        self.judge = judge
        self.ai0 = ai0
        self.ai1 = ai1
        self.updater = updater
        self.uploader = uploader
        self.result = {}

    def _prepareBattle(self):
        print '      Copying...'

        self.tmpdir = tempfile.mkdtemp()
        # Copy judge
        shutil.copytree(self.judge, path.join(self.tmpdir, 'judge'))
        # Copy Clients
        shutil.copy(self.ai0['absPath'], path.join(self.tmpdir, 'ai0'))
        shutil.copy(self.ai1['absPath'], path.join(self.tmpdir, 'ai1'))

    def _runProgram(self, args, stdin=FNULL, stdout=FNULL, stderr=FNULL):
        return subprocess32.Popen(args, stdin=stdin, stdout=stdout, stderr=stderr, cwd=self.tmpdir, env={'PATH':self.tmpdir})

    def _runBattle(self):
        # Prepare path
        path_judge = path.join(self.tmpdir, 'judge', 'main.py')
        path_ai0 = path.join(self.tmpdir, 'ai0')
        path_ai1 = path.join(self.tmpdir, 'ai1')

        # Run the judge and let the judge run AIs
        print '      Running Judge ... ',
        judge = self._runProgram(['/usr/bin/python3', path_judge, path_ai0, path_ai1, 'p2dv'], stdin=subprocess32.PIPE, stderr=subprocess32.PIPE)
        print 'Done'

        # Wait for judge
        while True:
            judge.stdin.write('get steps\n')
            judge.stdin.flush()
            steps = judge.stderr.readline().strip()
            if steps == 'finished':
                break
            self.updater(steps)
            time.sleep(0.2)

        # Kill all
        if judge.poll() == None:
            judge.kill()

    def _clean(self):
        shutil.rmtree(self.tmpdir)
        pass

    def _uploadTexts(self):
        self.result['json'] = self.uploader(path.join(self.tmpdir, 'result.json'))
        self.result['stdin0'] = self.uploader(path.join(self.tmpdir, 'ai0_stdin.log'))
        self.result['stdout0'] = self.uploader(path.join(self.tmpdir, 'ai0_stdout.log'))
        self.result['stderr0'] = self.uploader(path.join(self.tmpdir, 'ai0_stderr.log'))
        self.result['stdin1'] = self.uploader(path.join(self.tmpdir, 'ai1_stdin.log'))
        self.result['stdout1'] = self.uploader(path.join(self.tmpdir, 'ai1_stdout.log'))
        self.result['stderr1'] = self.uploader(path.join(self.tmpdir, 'ai1_stderr.log'))

    def Run(self):
        time.sleep(1)
        self._prepareBattle()
        self._runBattle()

        with open(path.join(self.tmpdir, 'result.json')) as f:
            self.result = json.loads(f.read())

        self._uploadTexts()
        self._clean()

        return self.result
