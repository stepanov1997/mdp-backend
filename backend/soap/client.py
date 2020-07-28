from suds.client import Client

c = Client('http://127.0.0.1:5555/soap?wsdl')
print c.service.get_time()