## Serializers.py এর ভূমিকা

`serializers.py` ফাইলটি Django মডেল এবং JSON ডেটার মধ্যে তথ্য আদান-প্রদান সহজ করে।

### প্রধান কার্যাবলী:
1. **JSON Conversion:** মডেল অবজেক্টকে JSON-এ রূপান্তর করা।
2. **Data Validation:** ইউজার থেকে প্রাপ্ত ডেটা ডেটাবেসে সেভ করার আগে যাচাই করা।
3. **Data Security:** `write_only=True` ব্যবহার করে পাসওয়ার্ড বা সেনসিটিভ তথ্য গোপন রাখা।
4. **Custom Fields:** `SerializerMethodField` ব্যবহার করে কাস্টম লজিক অনুযায়ী নতুন ফিল্ড তৈরি করা।


### উদাহরণ:

### `serializers.py` তে ব্যাবহার করার নিয়মঃ
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
    
    Work-flow:
        1. আগে চেকিং (Validation): আপনি যখন serializer.is_valid() কল করেন, তখনই জ্যাঙ্গো চেক করে দেখেছে যে phone 
            ফিল্ডে ডাটা আছে কি না এবং সেটা ঠিক আছে কি না।
        2. ফোন আলাদা করা (Pop): User অবজেক্ট তৈরি করার ঠিক এক মুহূর্ত আগে আপনি phone টাকে পকেটস্থ (pop) করে নিলেন, 
            যাতে User মডেলের ভেতর এটা ঢুকে কোনো ঝামেলা না পাকায়।
        3. ইউজার তৈরি (User Object): এবার শুধু username, password, আর first_name দিয়ে আপনি মূল ইউজারটা তৈরি করলেন।
        4. ফোন ফেরত পাঠানো (Profile Object): ইউজার তৈরি হয়ে যাওয়ার পর, ওই পকেটস্থ করা phone ডাটা দিয়ে আপনি Profile 
            টেবিলে এন্ট্রি দিলেন।
    '''

    def create(self, validated_data):
        # ১. ডাটা আলাদা করা
        phone = validated_data.pop('phone')
        first_name = validated_data.pop('first_name')

        # ২. ইউজার তৈরি করা
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



'''
-> ModelSerializer বনাম Serializer

    * RegisterSerializer (ModelSerializer): যখন আপনি রেজিস্ট্রেশন করছেন, তখন আপনি মূলত ডেটাবেসে (User Model) একটি 
    নতুন ডেটা সেভ করছেন। ModelSerializer ব্যবহার করলে জ্যাঙ্গো নিজে থেকেই জানে যে কোন কোন ফিল্ড ডেটাবেসের কোন কলামে যাবে। 
    এখানে Meta ক্লাস ব্যবহার করে আমরা জ্যাঙ্গোকে বলে দিই— "ভাই, তুমি এই User মডেলের স্ট্রাকচারটা ফলো করো।"

    *LoginSerializer (Serializer): লগইন করার সময় আমরা ডেটাবেসে নতুন কোনো তথ্য সেভ করি না। আমরা শুধু ইউজার থেকে পাঠানো
    ফোন নম্বর আর পাসওয়ার্ড নিয়ে চেক (Validate) করে দেখি যে আমাদের ডেটাবেসে এই ইউজার আছে কি না। যেহেতু এখানে কোনো মডেলের 
    স্ট্রাকচার হুবহু কপি করার প্রয়োজন নেই, তাই আমরা সরাসরি serializers.Serializer ব্যবহার করি।
'''
```


### `views.py` তে ব্যাবহার করার নিয়মঃ
```python
from django.shortcuts import render
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, LoginSerializer
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Profile
from rest_framework_simplejwt.tokens import RefreshToken
# Create your views here.


def get_token_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }

class RegisterView(generics.CreateAPIView):
    queryset=User.objects.all()
    serializer_class=RegisterSerializer

# login
class LoginView(APIView):
    def post(self, request):
        # User theke data recieve korci 
        serializer = LoginSerializer(data=request.data)
        # User jei data diyece sei data valid data kina check korci
        serializer.is_valid(raise_exception=True)
        
        # Phone and Passward er validation check korci je valid format ba serializer er formate(like: charfield, 11 digit, etc) manteche kina
        # এখান থেকেই আপনি ইউজারের পাঠানো ডেটা পাচ্ছেন
        phone = serializer.validated_data['phone']
        password = serializer.validated_data['password']
        
        try:
            # Check korlam je ei number database e ache kina
            profile = Profile.objects.get(phone=phone)
            # Oy number er user ta nilam
            user = profile.user
        except Profile.DoesNotExist:
            return Response({'error': 'Invalid Phone Number'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Number nebar por password ta valid ba exact match hocce kina dekhlam
        if not user.check_password(password):
            return Response({'error': 'Invalid Phone or Password'}, status=status.HTTP_400_BAD_REQUEST)
        
        # User valid hole token generate korchi, Toke amra use kori cause amader django to sobai use korte na pare,
        # Onno kw phn ba onno framework use korte pare, tai valid hole amra take ekta token diye dibo and ei token diye se login korte parbe
        token = get_token_for_user(user)
        
        # Eikhane message and token must ditei hobe and baki ta iccha moto
        return Response({'message': 'Login Success', 'username':user.username, 'token': token}, status=status.HTTP_200_OK)
```


## Nested Serializers:
### Code:
```python
`models.py` 
class SubCartegory(models.Model):
    name=models.CharField(max_length=200)
    description=models.TextField(blank=True, null=True)
    is_active=models.BooleanField(default=False)
    created_at=models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.name

class Item(models.Model):
    name=models.CharField(max_length=100)
    description=models.TextField(blank=True, null=True)

    # related_name='items' eta exactly same name e serializers er field dite hobe and eta diyei nested serializer banano hoi
    subcategory=models.ForeignKey(SubCartegory, on_delete=models.CASCADE, related_name='items')  #Ekta subcategory te onkgula item thakte pare

    is_active=models.BooleanField(default=False)
    created_by=models.ForeignKey(User, related_name='user_information', on_delete=models.CASCADE, null=True, blank=True)
    created_at=models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
------------------------------------------------------------------------------------

`serializers.py`
class ItemSerializer(serializers.ModelSerializer):
    # Eikhane nijer table(Item) theke ekta field name('created_by') related korci as ('user_information')
    # So, eikhane bole dite hobe source ta ki and jodi 'related_name' use na kore 
    # Exact same('created_by') field add kori then ar source bole dite hobe na 
    user_information = serializers.StringRelatedField(source='created_by', read_only=True)
    
    # created_by = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Item
        fields = '__all__'


class SubCartegorySerializer(serializers.ModelSerializer):
    # items=ItemSerializer(read_only=True, many=True)         # All field dekhate item model er
    
    # Eikhane onno table(Item) theke data dekhabo tai 'source' bole dite hobe na
    # Eikhane source bole dite hocce na cause 'items' name kono field subcategory te nei
    # So eikhane 'related_name' dhore easily kaj korte parbe
    items=serializers.StringRelatedField(read_only=True, many=True)  # Just def _str_ er modde ja return koreci ota dekhane

    # items=serializers.PrimaryKeyRelatedField(read_only=True, many=True) # Just items er primary dekhane
    # items=serializers.HyperlinkedRelatedField(read_only=True, many=True, view_name='itemdetails') #itemsdetails link akare dekhabe
    class Meta:
        model=SubCartegory
        fields= ['name', 'items', 'description']
```






















