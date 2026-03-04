## 1. Rich Text এর দরকার কেন?
**Course description, lesson content, blog, notes—এগুলোতে দরকার:**
  - Bold / Italic / Underline
  - Bullet / Numbered list
  - Image / Video / Code embed
  - Links / Table / Styling
এগুলো HTML বা editor ছাড়া normal textarea দিয়ে দেওয়া কঠিন।

## CKEditor কি?
  - CKEditor = WYSIWYG editor
  - WYSIWYG = What You See Is What You Get
  - মানে তুমি যা editor এ দেখবে, frontend এ সেইরকম দেখাবে
  - অনেক ধরনের formatting সহজে করা যাবে

## Django DRF এ CKEditor use কেন?
  - তুমি API-based site বানাচ্ছো → Admin বা frontend React/Vue থেকে data পাঠাবে
  - CKEditor → HTML content save করবে DB তে (description field)
  - DRF serializer → HTML 그대로 পাঠাবে API তে
  - Frontend → innerHTML দিয়ে render করবে

## CKEditor ছাড়া কি হবে?
**শুধু plain TextField use করলে:**
  - Image upload সম্ভব নয়
  - Formatting (bold, list, table) যাবে না
  - Course content boring হবে
  - তুমি যদি Markdown বা অন্য editor use করো → আলাদা parsing + extra setup লাগবে

## Setup:
   pip install django-ckeditor
   1. setiings e media file add + apps add + others add 
   2. models e [`RichTextUploadingField()`] add 
   3. project level urls e path add 

## Example:
```python
`models.py`
from ckeditor_uploader.fields import RichTextUploadingField
class Course(models.Model):
    description = RichTextUploadingField()  # CKEditor content
----------------------------------------------------

`settings.py`
INSTALLED_APPS = [
    ''' '''
    "ckeditor",
    "ckeditor_uploader",
]
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
CKEDITOR_UPLOAD_PATH = "uploads/"
CKEDITOR_CONFIGS = {
    "default": {
        "toolbar": "full",
        "height": 300,
        "width": "100%",
    }
}
--------------------------------------------

#project level url
`urls.py`
urlpatterns = [
    path("ckeditor/", include("ckeditor_uploader.urls")),  # CKEditor upload endpoint
]
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
-------------------------------------------

```



