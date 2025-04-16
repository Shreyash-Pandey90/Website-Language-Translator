from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from googletrans import Translator as GoogleTranslator
from django.shortcuts import render

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .models import TranslationCache
from googletrans import Translator
import json
from django.core.cache import cache

@csrf_exempt
def translate_text(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            input_text = data.get("text", "").strip()
            target_lang = data.get("lang", "hi")
            
            if not input_text:
                return JsonResponse({"error": "Empty text"}, status=400)
            
            cache_key = f"translation_{input_text[:100]}_{target_lang}"
            
            cached_translation = cache.get(cache_key)
            if cached_translation:
                return JsonResponse({"translated": cached_translation, "cached": True})
            
            db_translation = TranslationCache.objects.filter(
                source_text=input_text,
                target_lang=target_lang
            ).first()
            
            if db_translation:
                cache.set(cache_key, db_translation.translated_text, 3600*24)  # Cache for 24 hours
                return JsonResponse({
                    "translated": db_translation.translated_text,
                    "cached": True
                })
            
            translator = GoogleTranslator()
            result = translator.translate(input_text, src="en", dest=target_lang)
            
            # Store in database
            TranslationCache.objects.create(
                source_text=input_text,
                source_lang="en",
                target_lang=target_lang,
                translated_text=result.text
            )
            
            cache.set(cache_key, result.text, 3600*24)
            
            return JsonResponse({
                "translated": result.text,
                "cached": False
            })
            
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    return JsonResponse({"error": "Only POST allowed"}, status=405)

def demo_page(request):
    return render(request, 'demo.html')