# from django.urls import path
# from .views import translate_text
# from .views import demo_page


# urlpatterns = [
#     path('', demo_page),
#     path('api/translate/', translate_text, name='translate_text'),
# ]


from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import translate_text, demo_page

urlpatterns = [
    path('', demo_page),
    path('api/translate/', translate_text, name='translate_text'),
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)