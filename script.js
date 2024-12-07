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

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
        document.body.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        });
    });

    uploadArea.addEventListener('click', () => fileInput.click());

    uploadArea.addEventListener('dragover', () => {
        uploadArea.style.borderColor = '#007AFF';
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#E5E5E5';
    });

    uploadArea.addEventListener('drop', (e) => {
        uploadArea.style.borderColor = '#E5E5E5';
        if (e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    qualitySlider.addEventListener('input', (e) => {
        qualityValue.textContent = e.target.value + '%';
        if (originalFile) {
            compressImage(originalFile, e.target.value / 100);
        }
    });

    function handleFile(file) {
        if (file.type !== 'image/jpeg') {
            alert('请上传JPG格式图片！');
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

    function compressImage(file, quality) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d', { alpha: true });

                let targetWidth = img.width;
                let targetHeight = img.height;
                
                if (file.type === 'image/png') {
                    const minRatio = 0.5;
                    const maxRatio = 0.8;
                    const compressionRatio = minRatio + (quality / 100) * (maxRatio - minRatio);
                    const scaleFactor = Math.sqrt(compressionRatio);
                    targetWidth = Math.floor(img.width * scaleFactor);
                    targetHeight = Math.floor(img.height * scaleFactor);
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;

                if (file.type === 'image/png') {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.imageSmoothingEnabled = true;
                    ctx.imageSmoothingQuality = 'high';
                } else {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                canvas.toBlob((blob) => {
                    if (file.type === 'image/png') {
                        const compressionRate = blob.size / file.size;
                        if (compressionRate > 0.8 || compressionRate < 0.5) {
                            const newQuality = quality * (0.65 / compressionRate);
                            compressImage(file, newQuality);
                            return;
                        }
                    }

                    compressedImage.src = URL.createObjectURL(blob);
                    compressedSize.textContent = formatFileSize(blob.size);
                    
                    downloadBtn.onclick = () => {
                        const link = document.createElement('a');
                        link.href = URL.createObjectURL(blob);
                        link.download = `compressed_${originalFile.name}`;
                        link.click();
                    };
                }, file.type, file.type === 'image/png' ? 1 : quality);
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