import json
import os.path
import os
import sys

def check_services_running():
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(data["docservice"] > 0 and check_pid(data["docservice"])):
		sys.exit("Error : docservice running with pid (" + str(data["docservice"]) + ") ")
	if(data["spellchecker"] > 0 and check_pid(data["spellchecker"])):
		sys.exit("Error : spellchecker running with pid (" + str(data["spellchecker"]) + ") ")
	if(data["converter"] > 0 and check_pid(data["converter"])):
		sys.exit("Error : converter running with pid (" + str(data["converter"]) + ") ")	

def check_docservice_running():
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(data["docservice"] > 0 and check_pid(data["docservice"])):
		sys.exit("Error : docservice running with pid (" + str(data["docservice"]) + ") ")
	
def check_spellchecker_running():
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(data["spellchecker"] > 0 and check_pid(data["spellchecker"])):
		sys.exit("Error : spellchecker running with pid (" + str(data["spellchecker"]) + ") ")	

def check_converter_running():
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(data["converter"] > 0 and check_pid(data["converter"])):
		sys.exit("Error : converter running with pid (" + str(data["converter"]) + ") ")						

def check_pid(pid):        
    try:
        os.kill(pid, 0)
    except OSError:
        return False
    else:
        return True

def update_processid(docservice_process_id, spellchecker_process_id, converter_process_id):
	with open(processid_file_path, "r") as f:
		data = json.load(f)

	if(docservice_process_id > 0):
		data["docservice"] = docservice_process_id
	if(spellchecker_process_id > 0):
		data["spellchecker"] = spellchecker_process_id
	if(converter_process_id > 0):
		data["converter"] = converter_process_id	

	with open(processid_file_path, "w") as jsonFile:
		json.dump(data, jsonFile, indent=4)

	with open(processid_file_path, "r") as f:
		dataupdated = json.load(f)	
	#print("Process IDS docservice, spellchecker, converter :: "+str(dataupdated))	
processid_file_path = "process_id.json"