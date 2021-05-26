import json
import os.path
import getpass
import os

from os import path


def is_port_in_use(port):
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

####doc service config
def get_docservice_port(config):
	fetch_docservice_port_from_user(config)
	while config["docservice_port"] < 0 or is_port_in_use(config["docservice_port"]):
		print(" Port : "+config["docservice_port"]+" is invalid or already open. Please enter a valid port.")
		fetch_docservice_port_from_user(config)

	
	print("docservice_port port is :" + str(config["docservice_port"]))

def fetch_docservice_port_from_user(config):
	#check valid default port and port not in use
	with open(defaultjson_path, "r") as f:
			data = json.load(f)	

	while True:
		docservice_port = input("Enter docservice port number (Press enter to keep default): ")
		if docservice_port.isdigit():
			break
		elif not docservice_port:
			docservice_port = data["services"]["CoAuthoring"]["server"]["port"]
			break
		else:
			print("Only numbers between 0-65535 accepted.")

	config["docservice_port"] = int(docservice_port) 

def get_docservice_ssl_crt(config):
	docservice_cert_file_path = input("Enter docservice ssl .crt file path (Press enter to keep default): ")
	
	if docservice_cert_file_path:
		while not (path.exists(docservice_cert_file_path)):
			docservice_cert_file_path = input("Enter valid docservice ssl .crt file path : ")
	else:
		#check if the default path is valid
		with open(defaultjson_path, "r") as f:
			data = json.load(f)

		docservice_cert_file_path = data["services"]["CoAuthoring"]["ssl"]["cert"]
		while not (path.exists(docservice_cert_file_path)):
			docservice_cert_file_path = input("Enter valid docservice ssl .crt file path : ")

	config["docservice_cert_file_path"] = docservice_cert_file_path 


def get_docservice_ssl_key(config):
	docservice_key_file_path = input("Enter docservice ssl .key file path (Press enter to keep default): ")

	if docservice_key_file_path:
		while not (path.exists(docservice_key_file_path)):
			docservice_key_file_path = input("Enter valid docservice ssl .key file path : ")
	else:
		with open(defaultjson_path, "r") as f:
			data = json.load(f)

		docservice_key_file_path = data["services"]["CoAuthoring"]["ssl"]["key"]
		while not (path.exists(docservice_key_file_path)):
			docservice_key_file_path = input("Enter valid docservice ssl .key file path : ")

	config["docservice_key_file_path"] = docservice_key_file_path 



### spellchecker config

def get_spellchecker_port(config):
	fetch_spellchecker_port_from_user(config)
	while config["spellchecker_port"] < 0 or is_port_in_use(config["spellchecker_port"]):
		print(" Port : "+config["spellchecker_port"]+" is invalid or already open. Please enter a valid port.")
		fetch_spellchecker_port_from_user(config)
	
	print("spellchecker_port port is :" + str(config["spellchecker_port"]))

def fetch_spellchecker_port_from_user(config):
	#check valid default port and port not in use
	with open(defaultjson_path, "r") as f:
			data = json.load(f)	

	while True:
		spellchecker_port = input("Enter spellchecker port number (Press enter to keep default): ")
		if spellchecker_port.isdigit():
			break
		elif not spellchecker_port:
			spellchecker_port = data["SpellChecker"]["server"]["port"]
			break
		else:
			print("Only numbers between 0-65535 accepted.")

	config["spellchecker_port"] = int(spellchecker_port) 


def get_spellchecker_ssl_crt(config):
	spellchecker_cert_file_path = input("Enter spellchecker ssl .crt file path (Press enter to keep default): ")
	
	if spellchecker_cert_file_path:
		while not (path.exists(spellchecker_cert_file_path)):
			spellchecker_cert_file_path = input("Enter valid spellchecker ssl .crt file path : ")
	else:
		#check if the default path is valid
		with open(defaultjson_path, "r") as f:
			data = json.load(f)

		spellchecker_cert_file_path = data["SpellChecker"]["ssl"]["cert"]
		while not (path.exists(spellchecker_cert_file_path)):
			spellchecker_cert_file_path = input("Enter valid spellchecker ssl .crt file path : ")

	config["spellchecker_cert_file_path"] = spellchecker_cert_file_path 

def get_spellchecker_ssl_key(config):
	spellchecker_key_file_path = input("Enter spellchecker ssl .key file path (Press enter to keep default): ")

	if spellchecker_key_file_path:
		while not (path.exists(spellchecker_key_file_path)):
			spellchecker_key_file_path = input("Enter valid spellchecker ssl .key file path : ")
	else:
		with open(defaultjson_path, "r") as f:
			data = json.load(f)

		spellchecker_key_file_path = data["SpellChecker"]["ssl"]["key"]
		while not (path.exists(spellchecker_key_file_path)):
			spellchecker_key_file_path = input("Enter valid spellchecker ssl .key file path : ")

	config["spellchecker_key_file_path"] = spellchecker_key_file_path 


def generate_fonts_data():
	if not os.path.exists('../documentserver/fonts'):
		os.makedirs('../documentserver/fonts')
	os.chdir("../documentserver")
	os.system('LD_LIBRARY_PATH=${PWD}/server/FileConverter/bin server/tools/allfontsgen \
	--input="${PWD}/core-fonts" \
	--allfonts-web="${PWD}/sdkjs/common/AllFonts.js" \
	--allfonts="${PWD}/server/FileConverter/bin/AllFonts.js" \
	--images="${PWD}/sdkjs/common/Images" \
	--selection="${PWD}/server/FileConverter/bin/font_selection.bin" \
	--output-web=\'fonts\' \
	--use-system="true"')
	os.chdir("../bin")

def generate_presentation_themes():
	os.chdir("../documentserver")
	os.system('LD_LIBRARY_PATH=${PWD}/server/FileConverter/bin server/tools/allthemesgen \
	  --converter-dir="${PWD}/server/FileConverter/bin"\
	  --src="${PWD}/sdkjs/slide/themes"\
	  --output="${PWD}/sdkjs/common/Images"')
	os.chdir("../bin")

#updates default.json
def update_json(config):
	with open(defaultjson_path, "r") as f:
		data = json.load(f)

	# data["services"]["CoAuthoring"]["server"]["port"] = config["docservice_port"]
	data["services"]["CoAuthoring"]["ssl"]["key"] = config["docservice_key_file_path"]
	data["services"]["CoAuthoring"]["ssl"]["cert"] = config["docservice_cert_file_path"]

	# data["SpellChecker"]["server"]["port"] = config["spellchecker_port"]
	data["SpellChecker"]["ssl"]["key"] = config["spellchecker_key_file_path"]
	data["SpellChecker"]["ssl"]["cert"] = config["spellchecker_cert_file_path"]

	data["services"]["CoAuthoring"]["token"]["enable"]["browser"] = True
	data["services"]["CoAuthoring"]["token"]["enable"]["request"]["inbox"] = True
	data["services"]["CoAuthoring"]["token"]["enable"]["request"]["outbox"] = True

	data["services"]["CoAuthoring"]["requestDefaults"]["rejectUnauthorized"] = False

	data["services"]["CoAuthoring"]["secret"]["browser"]["string"] = config["jwt_secret"]
	data["services"]["CoAuthoring"]["secret"]["inbox"]["string"] = config["jwt_secret"]
	data["services"]["CoAuthoring"]["secret"]["outbox"]["string"] = config["jwt_secret"]
	data["services"]["CoAuthoring"]["secret"]["session"]["string"] = config["jwt_secret"]

	data["services"]["CoAuthoring"]["sql"]["dbPort"] = config["mysql_port"]
	data["services"]["CoAuthoring"]["sql"]["dbUser"] = config["mysql_user"]
	data["services"]["CoAuthoring"]["sql"]["dbPass"] = config["mysql_password"]


	data["services"]["CoAuthoring"]["secret"]["session"]["string"] = config["jwt_secret"]
	
	with open(defaultjson_path, "w") as jsonFile:
		json.dump(data, jsonFile, indent=4)


### config
def config_docservice(config = {}):
	
	# get_docservice_port(config)
	get_docservice_ssl_crt(config)
	get_docservice_ssl_key(config)

def config_spellchecker(config = {}):
	
	# get_spellchecker_port(config)
	get_spellchecker_ssl_crt(config)
	get_spellchecker_ssl_key(config)	


defaultjson_path = "../documentserver/server/Common/config/default.json"


if __name__ == '__main__':
	config ={}
	config_docservice(config)
	config_spellchecker(config)


	jwt_secret = input("Enter onlyoffice secret : ")

	config["jwt_secret"] = jwt_secret 
	#print(config)
	#mysql config
	mysql_port = input("Enter mysql port : ")
	config["mysql_port"] = mysql_port 

	mysql_user = input("Enter mysql username : ")
	config["mysql_user"] = mysql_user 

	mysql_password = getpass.getpass('Enter mysql password :')
	config["mysql_password"] = mysql_password 


	update_json(config)

	generate_fonts_data()
	generate_presentation_themes()

	print("Configuration done.")
