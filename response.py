import requests

# --> For view detailst (get)
res = requests.get("https://jsonplaceholder.typicode.com/posts")
print(res.status_code)
print(res.json())


# --> For create anything (post)
data = {'userId': 1, 'id': 1, 'title': 'i\'m rabbi hasan'}
res = requests.post("https://jsonplaceholder.typicode.com/posts", json=data)
print(res.status_code)
print(res.json())

# --> For update anything (put/patch)
data = {'userId': 1, 'id': 1, 'title': 'i\'m rabbi hasan (Updated)'}
res = requests.put("https://jsonplaceholder.typicode.com/posts/1", json=data)
print(res.status_code)
print(res.json())

# --> For Delete anything (Delete)
res = requests.delete("https://jsonplaceholder.typicode.com/posts/1")
print(res.status_code)
print(res.json())