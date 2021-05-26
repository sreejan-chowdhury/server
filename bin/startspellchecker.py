import os
import subprocess
import common_util


def start_spellchecker_service():
	spellchecker_process = subprocess.Popen([os.path.abspath("./../documentserver/server/SpellChecker/spellchecker"), "&"], env = env_var)
	print("spellchecker pid : "+str(spellchecker_process.pid))
	common_util.update_processid(-1, spellchecker_process.pid, -1)

env_var={}
env_var["NODE_ENV"] = "onlyofficeconfig"
env_var["NODE_CONFIG_DIR"] = os.path.abspath("../documentserver/server/Common/config")	

if __name__ == '__main__':
	common_util.check_spellchecker_running()