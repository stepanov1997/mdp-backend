from mongoengine import *

class User(Document):
    name = StringField(required=True, min_length=1, max_length=200)
    surname = StringField(required=True, min_length=1, max_length=200)
    jmbg = StringField(required=True, min_length=1, max_length=200)
    token = StringField(required=True, min_length=16, max_length=256)
    blocked = BooleanField(required=True)
