# admin.py
from django.contrib import admin
from .models import TranslationCache

@admin.register(TranslationCache)
class TranslationCacheAdmin(admin.ModelAdmin):
    list_display = ('source_lang', 'target_lang', 'truncated_source', 'truncated_translation')
    list_filter = ('source_lang', 'target_lang')
    search_fields = ('source_text', 'translated_text')
    
    def truncated_source(self, obj):
        return obj.source_text[:50] + '...' if len(obj.source_text) > 50 else obj.source_text
    truncated_source.short_description = 'Source Text'
    
    def truncated_translation(self, obj):
        return obj.translated_text[:50] + '...' if len(obj.translated_text) > 50 else obj.translated_text
    truncated_translation.short_description = 'Translation'