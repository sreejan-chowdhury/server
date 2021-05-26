import stopconverter
import stopspellchecker
import stopdocservice


if __name__ == '__main__':
	stopconverter.stop_converter_service()
	stopspellchecker.stop_spellchecker_service()
	stopdocservice.stop_docservice_service()