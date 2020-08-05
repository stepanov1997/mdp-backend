from time import ctime
from flask import Flask
from flaskext.enterprise import Enterprise
from controller import user_controller
from mongoengine import *

app = Flask(__name__)

connect('db')

enterprise = Enterprise(app)

String = enterprise._sp.String
Integer = enterprise._sp.Integer
Boolean = enterprise._sp.Boolean
Array = enterprise._scls.Array.


class DemoService(enterprise.SOAPService):
    __soap_server_address__ = '/soap'
    __soap_target_namespace__ = 'soap'

    @enterprise.soap(String, String, String, _returns=String)
    def signIn(self, name, surname, jmbg):
        token = user_controller.signInUser(name, surname, jmbg)
        return token

    @enterprise.soap(String, _returns=Boolean)
    def checkToken(self, token):
        isValid = user_controller.checkToken(token)
        return isValid

    @enterprise.soap(String, _returns=Boolean)
    def deactivateToken(self, token):
        success = user_controller.deactivateToken(token)
        return success

    @enterprise.soap(_returns=Array)
    def getActiveTokens(self):
        listTokens = user_controller.getActiveTokens()
        return listTokens

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8083)