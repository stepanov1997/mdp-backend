from suds.client import Client
import config

c = Client('http://' + config.SOAP_HOST + ':' + config.SOAP_PORT + '/soap?wsdl')
# print c.service.signIn("Kristijan", "Stepanov", "2711997840020")
print c.service.getActiveTokens()
# print c.service.checkToken("f5755699697645c5a7d9174c5f9ecfd")
