from suds.client import Client

c = Client('http://127.0.0.1:8083/soap?wsdl')
#print c.service.signIn("Kristijan", "Stepanov", "2711997840020")
#print c.service.getActiveTokens()
print c.service.checkToken("404b3f42e2704a478b86d9ae7f4f72c")