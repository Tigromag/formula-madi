// =============================================
//  Полный рабочий script.js для Formula MADI
// =============================================

const uploadModal      = document.getElementById('uploadModal');
const uploadArea       = document.getElementById('uploadArea');
const fileDetails      = document.getElementById('fileDetails');
const uploadProgress   = document.getElementById('uploadProgress');
const fileInput        = document.getElementById('fileInput');
const browseBtn        = document.getElementById('browseBtn');
const fileNameInput    = document.getElementById('fileNameInput');
const sectionSelect    = document.getElementById('sectionSelect');
const progressFill     = document.getElementById('progressFill');
const progressPercent  = document.getElementById('progressPercent');
const progressFileName = document.getElementById('progressFileName');

// =============================================
//  Закрытие модального окна
// =============================================
function closeModal() {
    uploadModal.classList.remove('active');
    setTimeout(() => {
        uploadArea.style.display = 'block';
        fileDetails.style.display = 'none';
        uploadProgress.style.display = 'none';
        document.getElementById('uploadForm').reset();
        progressFill.style.width = '0%';
        progressPercent.textContent = '0%';
    }, 300);
}

// Крестик и кнопка "Отмена"
document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
document.getElementById('cancelBtn')?.addEventListener('click', closeModal);

// =============================================
//  Открытие модалки по любой кнопке "Загрузить"
// =============================================
document.querySelectorAll('button').forEach(btn => {
    const text = btn.textContent.toLowerCase();
    if (text.includes('загрузить') || text.includes('upload') || btn.id?.includes('upload')) {
        btn.onclick = () => {
            uploadModal.classList.add('active');

            // Автоматически выбираем текущий раздел
            const activeNav = document.querySelector('.nav-item.active');
            if (activeNav && sectionSelect) {
                const href = activeNav.getAttribute('href');
                const parts = href.split('/');
                const section = parts[parts.length - 2]; // например: /section/chassis/ → chassis
                if (section) sectionSelect.value = section;
            }
        };
    }
});

// =============================================
//  Выбор файла
// =============================================
browseBtn.onclick = () => fileInput.click();

fileInput.onchange = () => {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        fileNameInput.value = file.name.replace(/\.[^/.]+$/, ""); // убираем расширение
        uploadArea.style.display = 'none';
        fileDetails.style.display = 'block';
    }
};

// Drag & Drop
uploadArea.ondragover  = e => { e.preventDefault(); uploadArea.classList.add('dragover'); };
uploadArea.ondragleave = () => uploadArea.classList.remove('dragover');
uploadArea.ondrop = e => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
    }
};

// =============================================
//  Загрузка с реальным прогресс-баром
// =============================================
document.getElementById('uploadForm').onsubmit = function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const file = fileInput.files[0];

    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload/', true);

    // Прогресс загрузки
    xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            progressFill.style.width = percent + '%';
            progressPercent.textContent = percent + '%';
            progressFileName.textContent = file.name;
        }
    };

    xhr.onload = () => {
        if (xhr.status === 200) {
            closeModal();
            location.reload(); // обновляем список файлов
        } else {
            alert('Ошибка загрузки. Попробуйте ещё раз.');
            closeModal();
        }
    };

    // Показываем прогресс-бар
    fileDetails.style.display = 'none';
    uploadProgress.style.display = 'block';

    xhr.send(formData);
};

// =============================================
//  Скачивание файла
// =============================================
function downloadFile(id) {
    window.location.href = `/download/${id}/`;
}

// =============================================
// Форматирование размера файла
// =============================================
function formatBytes(bytes) {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// =============================================
// Поиск (AJAX)
// =============================================
const searchInput   = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

if (searchInput && searchResults) {
    searchInput.addEventListener('input', function() {
        const q = this.value.trim();
        if (q.length < 2) {
            searchResults.style.display = 'none';
            return;
        }

        fetch(`/search/?q=${encodeURIComponent(q)}`)
            .then(r => r.json())
            .then(data => {
                searchResults.innerHTML = '';
                if (data.results.length === 0) {
                    searchResults.innerHTML = '<div class="search-result-item">Ничего не найдено</div>';
                } else {
                    data.results.forEach(file => {
                        const item = document.createElement('div');
                        item.className = 'search-result-item';
                        item.innerHTML = `
                            <div class="search-result-icon ${file.file_type}">
                                ${file.file_type.toUpperCase().slice(0,3)}
                            </div>
                            <div>
                                <div style="font-weight:600;cursor:pointer" onclick="downloadFile(${file.id})">
                                    ${file.name}
                                </div>
                                <div style="font-size:12px;color:var(--gray)">
                                    ${file.section} • ${formatBytes(file.size)}
                                </div>
                            </div>
                        `;
                        searchResults.appendChild(item);
                    });
                }
                searchResults.style.display = 'block';
            })
            .catch(() => {
                searchResults.innerHTML = '<div class="search-result-item">Ошибка поиска</div>';
                searchResults.style.display = 'block';
            });
    });

    // Скрываем при клике вне
    document.addEventListener('click', e => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
        }
    });
}

