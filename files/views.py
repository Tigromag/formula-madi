from django.shortcuts import render, redirect, get_object_or_404
from django.http import FileResponse, JsonResponse, HttpResponse
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.db.models import Count, Max
from .models import ProjectFile
from .forms import ProjectFileForm, RegisterForm

def register(request):
    if request.method == 'POST':
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Добро пожаловать, {user.first_name}!")
            return redirect('files:dashboard')
    else:
        form = RegisterForm()
    return render(request, 'register.html', {'form': form})

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
            return redirect('files:dashboard')
        else:
            messages.error(request, "Неверный логин или пароль")
    return render(request, 'login.html')

def logout_view(request):
    logout(request)
    return redirect('files:dashboard')

@login_required
def upload_file(request):
    if request.method == 'POST':
        form = ProjectFileForm(request.POST, request.FILES)
        if form.is_valid():
            file_obj = form.save(commit=False)
            file_obj.uploaded_by = request.user
            file_obj.save()
            return HttpResponse(status=200)
    return HttpResponse(status=400)

def dashboard(request):
    config_files = ProjectFile.objects.filter(section='configurations')
    latest_config = config_files.order_by('-uploaded_at').first()

    total_configs = config_files.count()
    latest_version = latest_config.version if latest_config else "-"
    latest_config_name = latest_config.name if latest_config else "Нет конфигураций"

    active_users = ProjectFile.objects.values('uploaded_by').distinct().count()

    files = ProjectFile.objects.all()[:30]

    return render(request, 'dashboard.html', {
        'files': files,
        'total_files': ProjectFile.objects.count(),
        'total_configs': total_configs,
        'latest_version': latest_version,
        'latest_config_name': latest_config_name,
        'active_users': active_users,
        'user': request.user,
        'current_page': 'dashboard'
    })

def section_view(request, section):
    files = ProjectFile.objects.filter(section=section)
    return render(request, 'section.html', {
        'files': files,
        'total_files': ProjectFile.objects.count(),
        'current_page': section,
        'user': request.user,
    })

def download_file(request, pk):
    file_obj = get_object_or_404(ProjectFile, pk=pk)
    response = FileResponse(file_obj.file.open(), as_attachment=True, filename=file_obj.name)
    return response

def search_ajax(request):
    q = request.GET.get('q', '').strip()
    results = []
    if len(q) >= 2:
        results = ProjectFile.objects.filter(name__icontains=q)[:10]
        results = list(results.values('id', 'name', 'file_type', 'section', 'size', 'version'))
    return JsonResponse({'results': results})