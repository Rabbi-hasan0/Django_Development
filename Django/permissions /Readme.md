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
  আপনি `permissions.py`-তে যা যা করতে পারেন:

  -ওনারশিপ ভেরিফিকেশন (Ownership Check):
    এটি সবচেয়ে বেশি ব্যবহৃত হয়। আপনি নিশ্চিত করতে পারেন যে, একটি পোস্ট বা প্রোফাইল শুধুমাত্র সেই ইউজারই এডিট বা ডিলিট করতে পারবে যে এটি তৈরি করেছে।
    
    ```py
    class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS: # GET, HEAD, OPTIONS
            return True
        return obj.user == request.user # অবজেক্টের মালিক হলেই পারমিশন পাবে
    ```
    
  -রোল বেসড এক্সেস কন্ট্রোল (Role-Based Access - RBAC):
    আপনার অ্যাপে যদি বিভিন্ন ধরণের ইউজার থাকে (যেমন: Admin, Teacher, Student), তবে আপনি আলাদা আলাদা পারমিশন তৈরি করতে পারেন।
    
    ```py
    class IsTeacher(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'teacher'
    ```
  -আইপি অ্যাড্রেস রেস্ট্রিকশন (IP Restriction):
    আপনি চাইলে নির্দিষ্ট কোনো আইপি অ্যাড্রেস ছাড়া অন্য কাউকে আপনার API হিট করতে বাধা দিতে পারেন।

  -টাইম বেসড পারমিশন (Time-based Permission):
    এমন হতে পারে যে, আপনার LMS-এ কোনো কুইজ বা এসাইনমেন্ট শুধুমাত্র একটি নির্দিষ্ট সময়ের মধ্যে সাবমিট করা যাবে। সেই লজিকও আপনি এখানে সেট করতে পারেন।
    
---

৩. ভিউতে এটি যেভাবে ব্যবহার করবেন
  আপনি আপনার views.py-তে এই ক্লাসগুলো ইম্পোর্ট করে এভাবে সেট করবেন:
  
    ```py
    from .permissions import IsTeacher, IsOwnerOrReadOnly
    
    class CourseViewSet(viewsets.ModelViewSet):
        queryset = Course.objects.all()
        serializer_class = CourseSerializer
        permission_classes = [IsTeacher, IsOwnerOrReadOnly] # এখানে একাধিক পারমিশন দেওয়া যায়
    ```

### কি কি করা যায় (Core Features)

১. ওনারশিপ ভেরিফিকেশন (Ownership Check)
এটি নিশ্চিত করে যে, কোনো পোস্ট বা প্রোফাইল শুধুমাত্র তার মালিকই এডিট করতে পারবে।
* **ব্যবহার:** ইউজার নিজের প্রোফাইল আপডেট করার সময়।
* **সুবিধা:** এক ইউজার অন্য ইউজারের ডেটা পরিবর্তন করতে পারে না।

২. রোল বেসড এক্সেস কন্ট্রোল (Role-Based Access - RBAC)
ইউজারের রোলের ওপর ভিত্তি করে পারমিশন দেওয়া। যেমন:
* **Admin:** সব ডেটা দেখতে ও পরিবর্তন করতে পারবে।
* **Teacher:** শুধুমাত্র কোর্স তৈরি করতে পারবে।
* **Student:** শুধুমাত্র কোর্স এনরোল করতে পারবে।

৩. আইপি এবং টাইম রেস্ট্রিকশন
* নির্দিষ্ট আইপি অ্যাড্রেস থেকে রিকোয়েস্ট ব্লক বা অ্যালাউ করা যায়।
* অফিস আওয়ার বা নির্দিষ্ট সময়ের মধ্যে API হিট করার লিমিটেশন দেওয়া যায়।

---

## 💻 ব্যবহারের নিয়ম 

### কাস্টম পারমিশন তৈরি (Implementation):
```python
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # GET, HEAD, OPTIONS রিকোয়েস্ট সবাইকে অ্যালাউ করবে
        if request.method in permissions.SAFE_METHODS:
            return True
        # রাইট পারমিশন শুধুমাত্র মালিককে দিবে
        return obj.user == request.user
