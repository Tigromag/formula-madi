from django.db import models
from django.contrib.auth.models import User

class ProjectFile(models.Model):
    SECTION_CHOICES = [
        ('files', 'Файлы и документы'),
        ('configurations', 'Конфигурации'),
        ('powertrain', 'Силовая установка'),
        ('chassis', 'Шасси и подвеска'),
        ('aerodynamics', 'Аэродинамика'),
        ('battery', 'Батарея и BMS'),
        ('telemetry', 'Телеметрия'),
        ('calculations', 'Расчеты и симуляции'),
        ('versioning', 'Версионность'),
    ]

    TYPE_CHOICES = [
        ('cad', 'CAD модель'),
        ('doc', 'Документ'),
        ('analysis', 'Анализ/FEA'),
        ('spec', 'Спецификация'),
        ('other', 'Другое'),
    ]

    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='uploads/%Y/%m/%d/')
    file_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    section = models.CharField(max_length=50, choices=SECTION_CHOICES, default='files')
    version = models.CharField(max_length=20, blank=True, default='v1.0')
    description = models.TextField(blank=True)
    size = models.PositiveBigIntegerField(editable=False)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='uploaded_files')

    def save(self, *args, **kwargs):
        if self.file:
            self.size = self.file.size
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.uploaded_by or 'Неизвестно'})"

    class Meta:
        ordering = ['-uploaded_at']