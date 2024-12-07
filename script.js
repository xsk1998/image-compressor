document.addEventListener('DOMContentLoaded', function() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewContainer = document.getElementById('previewContainer');
    const originalImage = document.getElementById('originalImage');
    const compressedImage = document.getElementById('compressedImage');
    const originalSize = document.getElementById('originalSize');
    const compressedSize = document.getElementById('compressedSize');
    const qualitySlider = document.getElementById('quality');
    const qualityValue = document.getElementById('qualityValue');
    const downloadBtn = document.getElementById('downloadBtn');

    let originalFile = null;

    // 上传区域点击事件
    uploadArea.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    // 拖拽上传
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#E5E5E5';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#E5E5E5';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // 文件选择处理
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // 质量滑块变化事件
    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    // 处理上传的文件
    function handleFile(file) {
        if (!file.type.match('image.*')) {
            alert('请上传图片文件！');
            return;
        }

        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
            originalSize.textContent = formatFileSize(file.size);
            previewContainer.style.display = 'block';
            compressImage(file, qualitySlider.value / 100);
        };
        reader.readAsDataURL(file);
    }

    // 压缩图片
    function compressImage(file, quality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // 保持原始宽高比
                canvas.width = img.width;
                canvas.height = img.height;

                // 绘制图片
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);

                // 转换为压缩后的图片
                canvas.toBlob((blob) => {
                    compressedImage.src = URL.createObjectURL(blob);
                    compressedSize.textContent = formatFileSize(blob.size);
                    
                    // 更新下载按钮
                    downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `compressed_${originalFile.name}`;
                        link.click();
                    };
                }, file.type, quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // 阻止拖拽事件的默认行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults (e) {
        e.preventDefault();
        e.stopPropagation();
    }
}); 