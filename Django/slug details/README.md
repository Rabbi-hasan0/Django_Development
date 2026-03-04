## Slug details

### What is slug and why?
1. Slug is use for details view link as a string instead of pk
2. Like: 
    - without slug: product/1/
    - with slug:  product/iphone/
3. pk er jaigai string asbe ejonno slug use kori

### Setup slug:
1. Model er vitor slug field add dite hobe, same name product add korle jno 1,2,3.. eivabe increase hoi etar kaj korte hobe
2. views.py te [`lookup_field` = "slug"] add korte hobe
3. urls.py te [ `<int:pk>` ] etar jaigai [ `<slug:slug>` ] eta replace korte hobe

**Example**
```python
`models.py`
class Course(models.Model):
    title=models.CharField(max_length=200)
    description=models.TextField()
    teacher=models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, related_name='courses')
    price = models.DecimalField(max_digits=8, decimal_places=2, default=0)

    slug = models.SlugField(unique=True, editable=False)
    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title)
            slug = base_slug

            counter = 1                                # Jodi same name hoi then counter 1 kore barabe
            while Course.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            self.slug = slug
            
        super().save(*args, **kwargs)
        
    def __str__(self): 
        return f"{self.title}"
-----------------------------------------------------

#1️⃣ Generic API View (DRF): 
# usecase: REST API বানানো, slug দিয়ে GET/PUT/DELETE করা।
`views.py`
class CourseDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset=Course.objects.all()
    serializer_class=CourseSerializer
    permission_classes=[IsAuthenticated]
    lookup_field = "slug"        # ⭐ most important
    lookup_url_kwarg = "slug"    # optional but clear

`urls.py`
urlpatterns = [
    path("api/courses/<slug:slug>/", CourseDetailAPIView.as_view(), name="api-course-detail"),
]

## Flow:
--URL: /api/courses/django-for-beginners/
--DRF internally করবে: Course.objects.get(slug=slug_from_url)
---------------------


#2️⃣ Class-Based View (DetailView):
# usecase: Simple page render করতে হবে (HTML template), slug দিয়ে URL খুঁজে দেখাতে।
`views.py`
class CourseDetailView(DetailView):
    model = Course
    template_name = "course_detail.html"
    slug_field = "slug"      # Course model এ slug field
    slug_url_kwarg = "slug"  # URL e use করা name

`urls.py`
urlpatterns = [
    path("courses/<slug:slug>/", CourseDetailView.as_view(), name="course-detail"),
]

## Flow:
--URL: /courses/django-for-beginners/
--Django internally করবে: Course.objects.get(slug=slug_from_url)
----------------------


#3️⃣ Function-Based View (FBV)
# Use case: Quick/simple view, slug দিয়ে data খুঁজে দেখানো।
`views.py`
from django.shortcuts import get_object_or_404, render
from .models import Course

def course_detail(request, slug):
    course = get_object_or_404(Course, slug=slug)
    return render(request, "course_detail.html", {"course": course})

`urls.py`
urlpatterns = [
    path("courses/<slug:slug>/", course_detail, name="course-detail-fbv"),
]


## Flow:
--URL: /courses/django-for-beginners/
--get_object_or_404 দিয়ে slug match করে object আনে।
-------------------------------------------------------
-------------------------------------------------------
```




































