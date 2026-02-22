<div>
  Django REST Framework (DRF)-এ permissions.py ফাইলটি মূলত আপনার API-এর Security Guard হিসেবে কাজ করে। এখানে আপনি ঠিক করেন যে কে আপনার ডেটা দেখতে পারবে, কে এডিট করতে পারবে আর কার কোনো এক্সেস থাকবে না।

  permissions.py-তে আপনি মূলত নিচের কাজগুলো করতে পারেন:
</div>

# Django REST Framework (DRF) Custom Permissions

এই প্রজেক্টে `permissions.py` ব্যবহার করে API-এর সিকিউরিটি এবং এক্সেস কন্ট্রোল নিশ্চিত করা হয়েছে। নিচে এর বিস্তারিত আলোচনা করা হলো।

---

## 🛠 `permissions.py` কি এবং কেন?

`permissions.py` হলো আপনার API-এর **Security Guard**। এটি নির্ধারণ করে কোন ইউজার কোন ডেটা দেখতে পারবে, এডিট করতে পারবে বা ডিলিট করতে পারবে। মূলত এটি দুইভাবে কাজ করে:

1.  **Global Level (`has_permission`):** পুরো ভিউতে ইউজার ঢুকতে পারবে কি না তা চেক করে।
2.  **Object Level (`has_object_permission`):** নির্দিষ্ট একটি ডেটা বা রো (Row) এডিট/ডিলিট করার পারমিশন আছে কি না তা চেক করে।

---

## 🚀 কি কি করা যায় (Core Features)

আপনার প্রোজেক্টে এই ফাইলে নিচের লজিকগুলো ইমপ্লিমেন্ট করা যায়:

### ১. ওনারশিপ ভেরিফিকেশন (Ownership Check)
এটি নিশ্চিত করে যে, কোনো পোস্ট বা প্রোফাইল শুধুমাত্র তার মালিকই এডিট করতে পারবে।
* **ব্যবহার:** ইউজার নিজের প্রোফাইল আপডেট করার সময়।
* **সুবিধা:** এক ইউজার অন্য ইউজারের ডেটা পরিবর্তন করতে পারে না।

### ২. রোল বেসড এক্সেস কন্ট্রোল (Role-Based Access - RBAC)
ইউজারের রোলের ওপর ভিত্তি করে পারমিশন দেওয়া। যেমন:
* **Admin:** সব ডেটা দেখতে ও পরিবর্তন করতে পারবে।
* **Teacher:** শুধুমাত্র কোর্স তৈরি করতে পারবে।
* **Student:** শুধুমাত্র কোর্স এনরোল করতে পারবে।

### ৩. আইপি এবং টাইম রেস্ট্রিকশন
* নির্দিষ্ট আইপি অ্যাড্রেস থেকে রিকোয়েস্ট ব্লক বা অ্যালাউ করা যায়।
* অফিস আওয়ার বা নির্দিষ্ট সময়ের মধ্যে API হিট করার লিমিটেশন দেওয়া যায়।

---

## 💻 ব্যবহারের নিয়ম (Implementation)

### কাস্টম পারমিশন তৈরি:
```python
from rest_framework import permissions

class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        # GET, HEAD, OPTIONS রিকোয়েস্ট সবাইকে অ্যালাউ করবে
        if request.method in permissions.SAFE_METHODS:
            return True
        # রাইট পারমিশন শুধুমাত্র মালিককে দিবে
        return obj.user == request.user
