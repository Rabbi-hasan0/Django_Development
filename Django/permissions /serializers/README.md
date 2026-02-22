### Serializers.py এর ভূমিকা

`serializers.py` ফাইলটি Django মডেল এবং JSON ডেটার মধ্যে তথ্য আদান-প্রদান সহজ করে।

### প্রধান কার্যাবলী:
1. **JSON Conversion:** মডেল অবজেক্টকে JSON-এ রূপান্তর করা।
2. **Data Validation:** ইউজার থেকে প্রাপ্ত ডেটা ডেটাবেসে সেভ করার আগে যাচাই করা।
3. **Data Security:** `write_only=True` ব্যবহার করে পাসওয়ার্ড বা সেনসিটিভ তথ্য গোপন রাখা।
4. **Custom Fields:** `SerializerMethodField` ব্যবহার করে কাস্টম লজিক অনুযায়ী নতুন ফিল্ড তৈরি করা।


### উদাহরণ:
```python
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile # নিশ্চিত করুন এটি models থেকে ইমপোর্ট করা হয়েছে

class RegisterSerializer(serializers.ModelSerializer):

    # Meta class er age jei jei field dibo oy field er data gula json akare pabo
    phone = serializers.CharField(required=True, write_only=True)
    first_name = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ['username', 'password', 'phone', 'first_name']
        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }
    '''
    Django REST Framework-এর BaseSerializer ক্লাসে আগে থেকেই create এবং update নামে দু্টি মেথড ডিফাইন করা আছে। 
    আপনি যখন সিরিয়ালাইজারে create লিখছেন, তখন আপনি আসলে ওই মেইন মেথডটাকে Override করছেন।

    আপনি যখন আপনার ভিউতে (views.py) গিয়ে serializer.save() কল করেন, তখন জ্যাঙ্গো ইন্টারনালিবাবে নিচের কাজটা করে:
        -যদি অবজেক্টটা নতুন হয়, তবে সে সিরিয়ালাইজারের create() মেথডকে খোঁজে।
        -যদি অবজেক্টটা আগে থেকেই থাকে (আপডেট করার সময়), তবে সে update() মেথডকে খোঁজে।
    
    Main logic:
        1. আগে চেকিং (Validation): আপনি যখন serializer.is_valid() কল করেন, তখনই জ্যাঙ্গো চেক করে দেখেছে যে phone ফিল্ডে ডাটা আছে কি না এবং সেটা ঠিক আছে কি না।
        2. ফোন আলাদা করা (Pop): User অবজেক্ট তৈরি করার ঠিক এক মুহূর্ত আগে আপনি phone টাকে পকেটস্থ (pop) করে নিলেন, যাতে User মডেলের ভেতর এটা ঢুকে কোনো ঝামেলা না পাকায়।
        3. ইউজার তৈরি (User Object): এবার শুধু username, password, আর first_name দিয়ে আপনি মূল ইউজারটা তৈরি করলেন।
        4. ফোন ফেরত পাঠানো (Profile Object): ইউজার তৈরি হয়ে যাওয়ার পর, ওই পকেটস্থ করা phone ডাটা দিয়ে আপনি Profile টেবিলে এন্ট্রি দিলেন।
    '''

    def create(self, validated_data):
        # ১. ডাটা আলাদা করা
        phone = validated_data.pop('phone')
        first_name = validated_data.pop('first_name')

        # ২. ইউজার তৈরি করা (এখানে ( ) ব্র্যাকেট ব্যবহার করুন)
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            first_name=first_name
        ) # ব্র্যাকেট সংশোধন করা হয়েছে

        # ৩. প্রোফাইল তৈরি করা
        Profile.objects.create(user=user, phone=phone)
        
        return user


class LoginSerializer(serializers.Serializer):
    phone = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
```
