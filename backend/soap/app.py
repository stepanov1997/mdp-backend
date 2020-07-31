from time import ctime
from flask import Flask
from flaskext.enterprise import Enterprise
from mongoengine import *

app = Flask(__name__)

connect('db')


class User(Document):
    name = StringField(required=True, min_length=1, max_length=200)
    surname = StringField(required=True, min_length=1, max_length=200)
    jmbg = StringField(required=True, min_length=1, max_length=200)


enterprise = Enterprise(app)

String = enterprise._sp.String
Integer = enterprise._sp.Integer
Boolean = enterprise._sp.Boolean
Array = enterprise._scls.Array


class DemoService(enterprise.SOAPService):
    __soap_server_address__ = '/soap'
    __soap_target_namespace__ = 'soap'

    @enterprise.soap(_returns=String)
    def get_time(self):
        return ctime()

    @enterprise.soap(String, String, String, _returns=String)
    def signIn(self, name, surname, jmbg):
        try:
            user = User(name=name, surname=surname, jmbg=jmbg)
            user.save()
        except Exception as e:
            print(e)
            return "404"
        return str(user.id)


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8083)