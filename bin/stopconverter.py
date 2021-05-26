import os
import subprocess
import common_util
import json


def stop_converter_service():
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(data["converter"] > 0 and common_util.check_pid(data["converter"])):
		os.kill(int(data["converter"]), 9)

processid_file_path = "process_id.json"

if __name__ == '__main__':
	stop_converter_service()