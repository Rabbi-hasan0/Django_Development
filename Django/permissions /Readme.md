<div>
  
</div>

## Django REST Framework (DRF) Custom Permissions
Django REST Framework (DRF)-এ `permissions.py` ফাইলটি মূলত আপনার API-এর Security Guard হিসেবে কাজ করে। এখানে আপনি ঠিক করেন যে কে আপনার ডেটা দেখতে পারবে, কে এডিট করতে পারবে আর কার কোনো এক্সেস থাকবে না।

---

### `permissions.py`-তে আপনি মূলত নিচের কাজগুলো করতে পারেন:

১. কাস্টম পারমিশন ক্লাস তৈরি (Custom Permission Class)
    আপনি `BasePermission` ক্লাস ব্যবহার করে নিজের দরকার মতো লজিক লিখতে পারেন। এতে সাধারণত দুটি মেথড থাকে:
  
  *  `has_permission(self, request, view):` এটি পুরো ভিউ লেভেলে চেক করে। যেমন: ইউজার কি লগইন করা? সে কি স্টুডেন্ট নাকি টিচার?
  *  `has_object_permission(self, request, view, obj):` এটি স্পেসিফিক একটি অবজেক্টের ওপর চেক করে। যেমন: একজন স্টুডেন্ট কি অন্যজনের প্রোফাইল এডিট করার চেষ্টা করছে?



২. কমন কিছু ব্যবহারের উদাহরণ (Use Cases)

  * ওনারশিপ ভেরিফিকেশন (Ownership Check):
    এটি সবচেয়ে বেশি ব্যবহৃত হয়। আপনি নিশ্চিত করতে পারেন যে, একটি পোস্ট বা প্রোফাইল শুধুমাত্র সেই ইউজারই এডিট বা ডিলিট করতে পারবে যে এটি তৈরি করেছে।
  ```python
  class IsOwnerOrReadOnly(permissions.BasePermission):
  def has_object_permission(self, request, view, obj):
      if request.method in permissions.SAFE_METHODS: # GET, HEAD, OPTIONS
          return True
      return obj.user == request.user # অবজেক্টের মালিক হলেই পারমিশন পাবে
  ```
    
  * রোল বেসড এক্সেস কন্ট্রোল (Role-Based Access - RBAC):
    আপনার অ্যাপে যদি বিভিন্ন ধরণের ইউজার থাকে (যেমন: Admin, Teacher, Student), তবে আপনি আলাদা আলাদা পারমিশন তৈরি করতে পারেন।
    ```python
    class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'teacher'
    ```
  * আইপি অ্যাড্রেস রেস্ট্রিকশন (IP Restriction):
    আপনি চাইলে নির্দিষ্ট কোনো আইপি অ্যাড্রেস ছাড়া অন্য কাউকে আপনার API হিট করতে বাধা দিতে পারেন।
    ```python
    class IsAllowedIP(permissions.BasePermission):
    allowed_ips = ['127.0.0.1', '192.168.1.1']
    
    def has_permission(self, request, view):
        client_ip = request.META.get('REMOTE_ADDR')
        return client_ip in self.allowed_ips
    ```

  * টাইম বেসড পারমিশন (Time-based Permission):
    এমন হতে পারে যে, আপনার LMS-এ কোনো কুইজ বা এসাইনমেন্ট শুধুমাত্র একটি নির্দিষ্ট সময়ের মধ্যে সাবমিট করা যাবে। সেই লজিকও আপনি এখানে সেট করতে পারেন।
    ```python
    from datetime import datetime, time
    
    class IsOfficeHour(permissions.BasePermission):
        def has_permission(self, request, view):
            now = datetime.now().time()
            office_start, office_end = time(9, 0), time(17, 0)
            return office_start <= now <= office_end

    ```
---


৩. `views.py` এটি যেভাবে ব্যবহার করবেন:
  ```python
  from rest_framework import viewsets
  from .permissions import IsTeacher, IsOwnerOrReadOnly
  from .serializers import CourseSerializer
  from .models import Course
  
  class CourseViewSet(viewsets.ModelViewSet):
      queryset = Course.objects.all()
      serializer_class = CourseSerializer
      permission_classes = [IsTeacher, IsOwnerOrReadOnly] # এখানে একাধিক পারমিশন দেওয়া যায়
  ```
