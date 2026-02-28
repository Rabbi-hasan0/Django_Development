## 👤 Django User Model Features & Capabilities

This document describes what we can implement using Django's built-in **User Model** for authentication, authorization, and user management.

---

## 🚀 Core Features (Built-in)

Django provides a ready-to-use authentication system.

### ✅ Default Fields
  - username
  - first_name
  - last_name
  - email
  - password (hashed & secure)
  - is_active
  - is_staff
  - is_superuser
  - date_joined
  - last_login

---

### ✅ Authentication System
We get these features automatically:

  - User Registration
  - Login / Logout
  - Session handling
  - Password hashing
  - Password change
  - Password reset
  - Remember logged-in user

Example:
```python
from django.contrib.auth import authenticate, login, logout
```
---

### ✅ Authorization (Permissions)

Django provides a powerful **role & permission-based access control system**.

### 👥 Groups (Roles)

We can create roles like:

  - Admin
  - Instructor
  - Student
  - Customer

Each group can have different permissions.

---

### 🔑 Permissions

Django automatically provides:

  - add
  - change
  - delete
  - view

We can also add **custom permissions**.

### Example
```python
@permission_required('courses.add_course')
```


## ✅ Amra chaile User model e custom kichu fields add korte pari
```python
models.py
class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    phone = models.CharField(max_length=15)
    image = models.ImageField()
    address = models.TextField()
```
But (Recomended use AbstractUser)
```python 
models.py  
from django.contrib.auth.models import AbstractUser
class User(AbstractUser):
    phone = models.CharField(max_length=15)
    role = models.CharField(max_length=20)

settings.py
AUTH_USER_MODEL = 'accounts.User'
```
