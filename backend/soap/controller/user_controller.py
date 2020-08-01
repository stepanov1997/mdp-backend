import os,sys
sys.path.append(os.path.abspath('../util'))
sys.path.append(os.path.abspath('../model'))
from util import token_generator
from model import User

def signInUser(name, surname, jmbg):
    user = None
    token = token_generator.generate_token(32) 

    try:
        try:
            user = User.User.objects(name=name, surname=surname, jmbg=jmbg)[0]
            print(str(user))
            user.token = token
            user.save()
        except:
            print(token)
            user = User.User(name=name, surname=surname, jmbg=jmbg, token=token)
            user.save()

    except Exception as e:
        print(e)
        return None
    
    return str(user.token)


def checkToken(token):
    count = 0
    try:
        users = User.User.objects(token=token)
        count = len(users)
    except:
        return None
    if count>0:
        return users[0].name
    else: 
        return None
