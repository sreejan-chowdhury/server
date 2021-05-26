import os
import subprocess
import common_util


def start_converter_service():
	converter_process = subprocess.Popen([os.path.abspath("./../documentserver/server/FileConverter/converter"), "&"], env = env_var)
	#docservice_process.wait()
	print("converter pid : "+str(converter_process.pid))
	common_util.update_processid(-1, -1, converter_process.pid)

env_var={}
env_var["NODE_ENV"] = "onlyofficeconfig"
env_var["NODE_CONFIG_DIR"] = os.path.abspath("../documentserver/server/Common/config")
env_var["LD_LIBRARY_PATH"] = os.path.abspath("../documentserver/server/FileConverter/bin")

if __name__ == '__main__':
	common_util.check_converter_running()

