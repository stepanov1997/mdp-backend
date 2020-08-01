import uuid

def generate_token(string_length=16):
    print(string_length)
    random = str(uuid.uuid4()) 
    random = random.replace("-", "")
    if len(random) < string_length:
        random += generate_token(string_length - len(random))
    print(random)
    return random[0:string_length-1]