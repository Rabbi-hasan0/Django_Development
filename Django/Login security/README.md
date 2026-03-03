## Django DRF Login System with Phone & Rate Limiting

**Description**  
এই project শুধুমাত্র **login API** নিয়ে, যেখানে:

1. Phone-based login (custom backend ব্যবহার করে)  
2. 2 বার ভুল password দিলে temporary block (cache-based)  
3. Global rate limiting (DRF throttle)  
4. Endpoint-specific throttle  

First Install some package:
```
pip install django-axes
python manage.py makemigrations axes
python manage.py makemigrations
python manage.py migrate
then runserver
```
---

## 🛠 Features

### 1️⃣ Phone-based Login
- Users login করতে পারবে **phone number + password** দিয়ে।  
- Django default username/password দিয়ে login হয়। কিন্ত এখানে ফোন নাম্বার দিয়ে লগইন এজন্য আলাদা করে [backends.py] ফাইলে কাজ করা লাগছে।  
- Custom backend (`myshop/backends.py`) implement করা হয়েছে।  

**Wrong Attempts → Temporary Block**
- Maximum **2 wrong attempts** allowed।  
- **BLOCK_TIME = 2 মিনিট** (cache-based).  
- Correct login হলে attempts automatically reset হয়।
  
**Setup:**
1. Create a file in app [ backends.py ]
2. Modify login class [views.py]
3. Add apps and middleware in [settings.py]
4. Note: user = authenticate(request=request, phone=phone, password=password) ছাড়া না। like: user=user.check_password(password) এটা দিলে কাজ করবে না ।
```
backends.py
---------------------------------------------------------
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model
from .models import Profile

User = get_user_model()

class PhoneBackend(BaseBackend):
    def authenticate(self, request, phone=None, password=None, **kwargs):
        try:
            profile = Profile.objects.get(phone=phone)
            user = profile.user
            if user.check_password(password):
                return user
        except Profile.DoesNotExist:
            return None

    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None
-------------------------------------------------------------------------

views.py
---------------------------------------------------------
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from django.core.cache import cache
from .serializers import LoginSerializer
from .utils import get_token_for_user  # JWT

def get_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

MAX_ATTEMPTS = 2
BLOCK_TIME = 120  # seconds

class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']

        cache_key = f"login_attempts_{phone}"
        attempts = cache.get(cache_key, 0)

        if attempts >= MAX_ATTEMPTS:
            return Response({'error': 'Account locked. Try again later.'}, status=403)

        user = authenticate(request=request, phone=phone, password=password)
        if user is None:
            cache.set(cache_key, attempts + 1, timeout=BLOCK_TIME)
            return Response({'error': 'Invalid phone or password'}, status=400)

        # success → reset attempts
        cache.delete(cache_key)
        token = get_token_for_user(user)
        return Response({'message': 'Login successful', 'token': token, 'username': user.username}, status=200)
-------------------------------------------------------------------------

settings.py
---------------------------------------------------------
INSTALLED_APPS = [
    ''' '''
    'axes',
]
MIDDLEWARE = [
    ''' '''
    'axes.middleware.AxesMiddleware',
]

## Add these two in settings
AUTHENTICATION_BACKENDS = [
    'myshop.backends.PhoneBackend',   # DO NOT import here
    'django.contrib.auth.backends.ModelBackend',
]
# Cache backend must be configured (for example Redis or default locmem)
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'login_attempts_cache',
    }
}
-------------------------------------------------------------------------
``` 

### 2️⃣ Rate Limiting (Global)
- DRF throttle system ব্যবহার করা হয়েছে।  
- Example: anonymous user max 50 req/min, logged-in max 200 req/min।  
- 429 Too Many Requests error দিলে API call block হয়।
  
**Setup:**
1. Add some rest-framework in `settings.py`
2. 
```
settings.py
---------------------------------------------------------
REST_FRAMEWORK = {
    ''' '''
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '50/min',    # anonymous max 50 req per min
        'user': '200/min',   # logged‑in user max 200/min
    },
}
----------------------------------------------------------------

views.py
---------------------------------------------------------
class LoginView(APIView):
    def post(self, request):
        serializer=LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        phone=serializer.validated_data["phone"]
        password=serializer.validated_data["password"]

        try:
            profile=Profile.objects.get(phone=phone)
            user=profile.user
        except:
            return Response({'error':'User not found'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not user.check_password(password):
            return Response({'error': 'password not matched'}, status=status.HTTP_400_BAD_REQUEST)
        
        token=get_token_for_user(user)
        return Response({'message':'Login successful', 'token':token, 'username':user.username}, status=status.HTTP_200_OK)
-------------------------------------------------------------------------------------------------

```

### 4️⃣ Endpoint-specific Throttle
- প্রতিটি heavy endpoint বা sensitive API এর জন্য custom throttle rate define করা যায়।  
- Example: `/courses/` API → 1000/hour per user.  
- যেই ক্লাসে আমি বেশি রিকুয়েস্ট দিতে চায় না ওই ক্লাসে আমি এটা ইউজ করতে পারি

```
#views.py
----
from rest_framework.throttling import ScopedRateThrottle

class CourseListView(APIView):
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'courses'
----

# settings.py
-----
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'courses': '1000/hour',
    }
}
----
```
---


### Install packages:
```
pip install django djangorestframework djangorestframework-simplejwt mysqlclient
```
