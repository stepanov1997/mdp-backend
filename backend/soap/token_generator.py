import uuid


def generate_token(string_length=16):
    print(string_length)
    random = str(uuid.uuid4())  # Convert UUID format to a Python string.
    random = random.replace("-", "")  # Remove the UUID '-'.
    if len(random) < string_length:
        random += generate_token(string_length - len(random))
    print(random)
    return random[0:string_length-1]  # Return the random string
