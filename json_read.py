import json

data = {
    "name": "Rabbi",
    "age":25,
    "is_student": False,
}

json_string = json.dumps(data, indent=4)

print(json_string)
print(type(json_string))