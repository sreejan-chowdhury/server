import startdocservice
import startspellchecker
import startconverter
import common_util

if __name__ == '__main__':
	common_util.check_services_running()
	startconverter.start_converter_service()
	startspellchecker.start_spellchecker_service()
	startdocservice.start_docservice_service()
