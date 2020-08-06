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
        return False
    if count>0:
        return True
    else: 
        return False

def deactivateToken(token):
    try:
        if not(checkToken(token)):
            return False
        user = User.User.objects(token=token)[0]
        user.token=None
        user.save()
    except:
        return False
    return True

def getActiveTokens():
    try:
        users = User.User.objects()
        return map(lambda user : user.token, users)
    except:
        return None
    return []
