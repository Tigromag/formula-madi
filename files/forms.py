from django import forms
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User
from .models import ProjectFile


class ProjectFileForm(forms.ModelForm):
    class Meta:
        model = ProjectFile
        fields = ['name', 'file', 'file_type', 'section', 'version', 'description']


class RegisterForm(UserCreationForm):
    email = forms.EmailField(required=False)
    first_name = forms.CharField(max_length=30, required=True, label="Имя")

    class Meta:
        model = User  # ← вот правильная строчка!
        fields = ['username', 'first_name', 'email', 'password1', 'password2']