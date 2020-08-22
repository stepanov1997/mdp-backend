import os, sys
import logging

sys.path.append(os.path.abspath('../util'))
sys.path.append(os.path.abspath('../model'))
from util import token_generator
from model import User


def signInUser(name, surname, jmbg):
    user = None
    token = token_generator.generate_token(32)

    try:
        try:
            user = User.User.objects(name=name, surname=surname, jmbg=jmbg, blocked=False)[0]
            user.token = token
            user.save()
            logging.info("Signing in user existing user.")
        except:
            logging.info("Signing in user non-existing user.")
            user = User.User(name=name, surname=surname, jmbg=jmbg, token=token, blocked=False)
            user.save()

    except Exception as e:
        logging.warning(e)
        return None

    return str(user.token)


def checkToken(token):
    logging.info("Checking token for "+token+"..")
    count = 0
    user = None
    try:
        users = User.User.objects(token=token)
        count = len(users)
        if count > 0:
            user = users[0]
    except Exception as e:
        logging.warning(e)
        logging.info("Token: " + token + " is not good.");
        return False
    if count > 0 and not (user == None) and not (user.blocked):
        logging.info("Token: "+token+" is good.");
        return True
    else:
        logging.info("Token: " + token + " is not good.");
        return False


def deactivateToken(token):
    try:
        if not (checkToken(token)):
            return False
        user = User.User.objects(token=token)[0]
        user.blocked = True
        user.save()
    except Exception as e:
        logging.warning(e)
        return False
    logging.info("Token: " + token + " is successfully disabled.");
    return True


def getActiveTokens():
    logging.info("Getting active tokens...")
    try:
        users = User.User.objects()
        return map(lambda user: user.token, [user for user in users if not (user.blocked)])
    except Exception as e:
        logging.warning(e)
        return None
