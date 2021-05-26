import os
import subprocess
import common_util
import json


def stop_docservice_service():
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(data["docservice"] > 0 and common_util.check_pid(data["docservice"])):
		os.kill(int(data["docservice"]), 9)

processid_file_path = "process_id.json"

if __name__ == '__main__':
	stop_docservice_service()