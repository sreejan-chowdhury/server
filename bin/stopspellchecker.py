import os
import subprocess
import common_util
import json


def stop_spellchecker_service():
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(data["spellchecker"] > 0 and common_util.check_pid(data["spellchecker"])):
		os.kill(int(data["spellchecker"]), 9)

processid_file_path = "process_id.json"

if __name__ == '__main__':
	stop_spellchecker_service()