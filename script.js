document.addEventListener('DOMContentLoaded', function() {
    const elements = {
        uploadArea: document.getElementById('uploadArea'),
        fileInput: document.getElementById('fileInput'),
        previewContainer: document.getElementById('previewContainer'),
        originalImage: document.getElementById('originalImage'),
        compressedImage: document.getElementById('compressedImage'),
        originalSize: document.getElementById('originalSize'),
        compressedSize: document.getElementById('compressedSize'),
        qualitySlider: document.getElementById('quality'),
        qualityValue: document.getElementById('qualityValue'),
        downloadBtn: document.getElementById('downloadBtn')
    };

    let originalFile = null;

    // 拖拽事件处理
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        elements.uploadArea.addEventListener(eventName, preventDefaults);
        document.body.addEventListener(eventName, preventDefaults);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 上传区域事件
    elements.uploadArea.addEventListener('click', () => elements.fileInput.click());
    elements.uploadArea.addEventListener('dragover', () => elements.uploadArea.style.borderColor = '#007AFF');
    elements.uploadArea.addEventListener('dragleave', () => elements.uploadArea.style.borderColor = '#E5E5E5');
    elements.uploadArea.addEventListener('drop', (e) => {
        elements.uploadArea.style.borderColor = '#E5E5E5';
        if (e.dataTransfer.files.length) handleFile(e.dataTransfer.files[0]);
    });

    // 文件选择事件
    elements.fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) handleFile(e.target.files[0]);
    });

    // 质量滑块事件
    elements.qualitySlider.addEventListener('input', (e) => {
        elements.qualityValue.textContent = e.target.value + '%';
        if (originalFile) compressImage(originalFile, e.target.value / 100);
    });

    function handleFile(file) {
        if (file.type !== 'image/jpeg') {
            alert('请上传JPG格式图片！');
            return;
        }

        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            elements.originalImage.src = e.target.result;
            elements.originalSize.textContent = formatFileSize(file.size);
            elements.previewContainer.style.display = 'block';
            compressImage(file, elements.qualitySlider.value / 100);
        };
        reader.readAsDataURL(file);
    }

    function compressImage(file, quality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                canvas.width = img.width;
                canvas.height = img.height;

                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob((blob) => {
                    elements.compressedImage.src = URL.createObjectURL(blob);
                    elements.compressedSize.textContent = formatFileSize(blob.size);
                    
                    elements.downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `compressed_${originalFile.name}`;
                        link.click();
                    };
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}); 