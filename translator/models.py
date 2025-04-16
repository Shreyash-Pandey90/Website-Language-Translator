# models.py
from django.db import models

class TranslationCache(models.Model):
    source_text = models.TextField()
    source_lang = models.CharField(max_length=10, default='en')
    target_lang = models.CharField(max_length=10)
    translated_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = [['source_text', 'source_lang', 'target_lang']]
        indexes = [
            models.Index(fields=['source_text', 'target_lang']),
        ]

    def __str__(self):
        return f"{self.source_lang}→{self.target_lang}: {self.source_text[:50]}"