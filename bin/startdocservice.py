import os
import subprocess
import common_util


def start_docservice_service():
	docservice_process = subprocess.Popen([os.path.abspath("./../documentserver/server/DocService/docservice"), "&"], env = env_var)
	#docservice_process.wait()
	print("docservice pid : "+str(docservice_process.pid))
	common_util.update_processid(docservice_process.pid, -1, -1)

env_var={}
env_var["NODE_ENV"] = "onlyofficeconfig"
env_var["NODE_CONFIG_DIR"] = os.path.abspath("../documentserver/server/Common/config")

if __name__ == '__main__':
	common_util.check_docservice_running()
	start_docservice_service()