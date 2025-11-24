from django.apps import AppConfig

class FilesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'files'           # ← теперь правильно
    verbose_name = 'Файловый менеджер'