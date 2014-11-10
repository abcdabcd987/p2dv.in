import subprocess
import tempfile
import shutil
import glob
from os import path

import const

class Prepare:

    def _unzip(self):
        print '      Unzipping...'

        self.tmpdir = tempfile.mkdtemp()
        child = subprocess.Popen(['unzip', self.ai['absPath'], '-d', self.tmpdir], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.unzip_stdout, self.unzip_stderr = child.communicate()
        exitcode = child.returncode
        return True if exitcode == 0 else False

    def _compile(self):
        print '      Compiling...'

        # Compile
        target = path.join(self.tmpdir, 'client');
        cpps = glob.glob(path.join(self.tmpdir, '*.cpp'))
        cflags = ['g++', '-Wall', '-O2', '-std=c++11', '-lpthread', '-lboost_system', '-o', target]
        child = subprocess.Popen(cflags + cpps, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.compile_stdout, self.compile_stderr = child.communicate()
        exitcode = child.returncode
        if exitcode != 0:
            return False

        # Move client to the specific directory
        ai_name = 'ai_' + str(self.ai['_id'])
        self.abspath = path.join(const.AI_SAVE_DIRECTORY, ai_name)
        shutil.move(target, self.abspath)
        return True

    def _clean(self):
        shutil.rmtree(self.tmpdir)

    def __init__(self, ai):
        self.ai = ai

    def Run(self):
        result = { 'status': 'failure' }
        if not self._unzip():
            result['error'] = "Unzip Failed. STDERR:\n" + self.unzip_stderr
        elif not self._compile():
            result['error'] = 'Compile Failed. STDERR:\n' + self.compile_stderr
        else:
            result['status'] = 'success'
            result['abspath'] = self.abspath
            result['info'] = '========== Unzip ==========\n' + self.unzip_stdout + '\n' + self.unzip_stderr + '\n========== Compile ==========\n' + self.compile_stdout + '\n' + self.compile_stderr
        self._clean()
        return result
