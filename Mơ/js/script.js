/**
 * MUSIC PLAYER WEB APPLICATION
 * Ứng dụng trình phát nhạc với cuộn ngang và hiển thị ảnh
 * Author: [Tên của bạn]
 * Version: 1.0
 */

// ===============================================
// PHẦN 1: LẤY CÁC PHẦN TỬ DOM
// ===============================================

// Lấy container chính cho cuộn ngang
const container = document.getElementById('scrollContainer');
// Lấy phần tử hiển thị hướng dẫn
const instruction = document.getElementById('instruction');
// Lấy ảnh chính hiển thị
const mainImage = document.getElementById('mainImage');

// Lấy các phần tử âm thanh
const audio = document.getElementById('backgroundMusic'); // Element audio HTML
const playPauseBtn = document.getElementById('playPauseBtn'); // Nút Play/Pause
const volumeControl = document.getElementById('volumeControl'); // Thanh điều chỉnh âm lượng
const songInfo = document.getElementById('songInfo'); // Hiển thị thông tin bài hát
const fileInput = document.getElementById('fileInput'); // Input chọn file

// ===============================================
// PHẦN 2: KHAI BÁO BIẾN TOÀN CỤC
// ===============================================

let isPlaying = false; // Trạng thái đang phát nhạc hay không
let currentAudioUrl = null; // URL của file nhạc hiện tại

// ===============================================
// PHẦN 3: CÀI ĐẶT BAN ĐẦU
// ===============================================

// Khởi tạo âm lượng mặc định là 50%
audio.volume = 0.5;

// Danh sách các đường dẫn có thể có của file nhạc nền
// Script sẽ thử từng đường dẫn để tìm file nhạc
const possiblePaths = [
  './music/background.mp4',    // Đường dẫn tương đối từ thư mục hiện tại
  './music/background.mp3',
  '/music/background.mp4',     // Đường dẫn tuyệt đối từ root
  '/music/background.mp3',
  'music/background.mp4',      // Đường dẫn không có ./
  'music/background.mp3',
  '../music/background.mp4',   // Đường dẫn lên thư mục cha (cho file trong html/)
  '../music/background.mp3'
];

// ===============================================
// PHẦN 4: XỬ LÝ HIỂN THỊ HƯỚNG DẪN
// ===============================================

// Ẩn hướng dẫn sau 7 giây (7000ms)
setTimeout(() => {
  instruction.classList.add('fade'); // Thêm class fade để tạo hiệu ứng mờ dần
}, 7000);

// ===============================================
// PHẦN 5: XỬ LÝ TẢI FILE NHẠC TỰ ĐỘNG
// ===============================================

/**
 * Hàm kiểm tra và tải file nhạc tự động
 * Thử từng đường dẫn trong danh sách possiblePaths
 * @returns {Promise<boolean>} true nếu tìm thấy file, false nếu không
 */
async function loadAudioFile() {
  // Hiển thị trạng thái đang tìm
  songInfo.textContent = 'Đang tìm file nhạc...';
  
  // Duyệt qua từng đường dẫn có thể
  for (let path of possiblePaths) {
    try {
      // Tạo một audio element tạm để test
      const testAudio = new Audio();
      
      // Sử dụng Promise để kiểm tra file có tồn tại không
      await new Promise((resolve, reject) => {
        // Nếu file load được thì resolve
        testAudio.oncanplay = () => resolve();
        // Nếu có lỗi thì reject
        testAudio.onerror = () => reject();
        // Bắt đầu load file
        testAudio.src = path;
      });
      
      // Nếu đến được đây nghĩa là file tồn tại
      audio.src = path; // Gán đường dẫn cho audio chính
      currentAudioUrl = path; // Lưu URL hiện tại
      songInfo.textContent = 'File nhạc đã sẵn sàng'; // Cập nhật trạng thái
      console.log('Loaded audio from:', path); // Log để debug
      return true; // Trả về thành công
      
    } catch (error) {
      // Nếu file không tồn tại, thử đường dẫn tiếp theo
      console.log('Cannot load:', path);
      continue;
    }
  }
  
  // Nếu không tìm thấy file nào
  songInfo.textContent = 'Không tìm thấy file nhạc - Chọn file thủ công';
  return false;
}

// ===============================================
// PHẦN 6: XỬ LÝ SỰ KIỆN LOAD TRANG
// ===============================================

// Khi trang web load xong, tự động tìm file nhạc
window.addEventListener('load', () => {
  loadAudioFile();
});

// ===============================================
// PHẦN 7: XỬ LÝ CHỌN FILE NHẠC THỦ CÔNG
// ===============================================

// Xử lý khi người dùng chọn file từ máy tính
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0]; // Lấy file đầu tiên được chọn
  
  // Kiểm tra file có phải là audio không
  if (file && file.type.startsWith('audio/')) {
    // Giải phóng URL cũ nếu có (để tránh memory leak)
    if (currentAudioUrl && currentAudioUrl.startsWith('blob:')) {
      URL.revokeObjectURL(currentAudioUrl);
    }
    
    // Tạo URL mới từ file được chọn
    currentAudioUrl = URL.createObjectURL(file);
    audio.src = currentAudioUrl; // Gán cho audio element
    songInfo.textContent = 'File: ' + file.name; // Hiển thị tên file
    
    // Reset trạng thái phát nhạc
    if (isPlaying) {
      isPlaying = false;
      playPauseBtn.textContent = '▶️ Play';
      playPauseBtn.classList.remove('active');
    }
  }
});

// ===============================================
// PHẦN 8: XỬ LÝ PLAY/PAUSE NHẠC
// ===============================================

// Xử lý sự kiện click nút Play/Pause
playPauseBtn.addEventListener('click', async () => {
  // Nếu chưa có file nhạc, thử tìm lại
  if (!audio.src && !currentAudioUrl) {
    const loaded = await loadAudioFile();
    if (!loaded) {
      songInfo.textContent = 'Vui lòng chọn file nhạc';
      return;
    }
  }

  // Nếu đang phát thì dừng
  if (isPlaying) {
    audio.pause(); // Dừng phát
    playPauseBtn.textContent = '▶️ Play'; // Đổi text nút
    playPauseBtn.classList.remove('active'); // Xóa class active
    isPlaying = false; // Cập nhật trạng thái
    songInfo.textContent = 'Đã dừng'; // Hiển thị trạng thái
  } 
  // Nếu chưa phát thì bắt đầu phát
  else {
    try {
      await audio.play(); // Phát nhạc (async vì có thể bị block bởi browser)
      playPauseBtn.textContent = '⏸️ Pause'; // Đổi text nút
      playPauseBtn.classList.add('active'); // Thêm class active
      isPlaying = true; // Cập nhật trạng thái
      songInfo.textContent = '♪ Đang phát nhạc nền ♪'; // Hiển thị trạng thái
    } catch (error) {
      // Xử lý lỗi khi không thể phát nhạc
      console.log('Lỗi phát nhạc:', error);
      songInfo.textContent = 'Lỗi: ' + error.message;
      playPauseBtn.textContent = '▶️ Play';
      playPauseBtn.classList.remove('active');
      isPlaying = false;
    }
  }
});

// ===============================================
// PHẦN 9: XỬ LÝ ĐIỀU CHỈNH ÂM LƯỢNG
// ===============================================

// Xử lý thanh trượt âm lượng
volumeControl.addEventListener('input', (e) => {
  // Chuyển đổi giá trị từ 0-100 thành 0-1
  audio.volume = e.target.value / 100;
});

// ===============================================
// PHẦN 10: XỬ LÝ CÁC SỰ KIỆN AUDIO
// ===============================================

// Khi nhạc kết thúc (không cần xử lý vì có thuộc tính loop)
audio.addEventListener('ended', () => {
  // Do có loop nên không cần xử lý ended
});

// Khi nhạc bị pause
audio.addEventListener('pause', () => {
  if (isPlaying) {
    playPauseBtn.textContent = '▶️ Play';
    playPauseBtn.classList.remove('active');
    isPlaying = false;
    songInfo.textContent = 'Đã dừng';
  }
});

// Khi nhạc bắt đầu phát
audio.addEventListener('play', () => {
  playPauseBtn.textContent = '⏸️ Pause';
  playPauseBtn.classList.add('active');
  isPlaying = true;
  songInfo.textContent = '♪ Đang phát nhạc nền ♪';
});

// Khi có lỗi với audio
audio.addEventListener('error', (e) => {
  console.log('Audio error:', audio.error);
  songInfo.textContent = 'Lỗi tải nhạc';
  isPlaying = false;
  playPauseBtn.textContent = '▶️ Play';
  playPauseBtn.classList.remove('active');
});

// ===============================================
// PHẦN 11: XỬ LÝ CUỘN NGANG BẰNG CHUỘT
// ===============================================

// Biến cuộn dọc thành cuộn ngang
container.addEventListener('wheel', (e) => {
  // Nếu có cuộn dọc
  if (e.deltaY !== 0) {
    e.preventDefault(); // Ngăn cuộn dọc mặc định
    
    // Tính toán tốc độ cuộn ngang
    // Nếu cuộn nhanh thì tăng tốc độ lên 2 lần
    const scrollSpeed = Math.abs(e.deltaY) > 100 ? e.deltaY * 2 : e.deltaY * 1.5;
    
    // Áp dụng cuộn ngang
    container.scrollLeft += scrollSpeed;
  }
}, { passive: false }); // passive: false để có thể preventDefault

// ===============================================
// PHẦN 12: HỖ TRỢ ĐIỀU KHIỂN BẰNG BÀN PHÍM
// ===============================================

// Xử lý phím bấm
document.addEventListener('keydown', (e) => {
  switch(e.key) {
    case 'ArrowLeft': // Phím mũi tên trái
      e.preventDefault();
      container.scrollLeft -= 100; // Cuộn trái 100px
      break;
      
    case 'ArrowRight': // Phím mũi tên phải
      e.preventDefault();
      container.scrollLeft += 100; // Cuộn phải 100px
      break;
      
    case ' ': // Phím Space
      e.preventDefault();
      playPauseBtn.click(); // Trigger click nút Play/Pause
      break;
  }
});

// ===============================================
// PHẦN 13: HỖ TRỢ TOUCH/SWIPE TRÊN MOBILE
// ===============================================

let touchStartX = 0; // Vị trí X khi bắt đầu touch
let touchStartY = 0; // Vị trí Y khi bắt đầu touch

// Khi bắt đầu touch
container.addEventListener('touchstart', (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
}, { passive: true });

// Khi di chuyển finger
container.addEventListener('touchmove', (e) => {
  if (!touchStartX || !touchStartY) return;

  const touchEndX = e.touches[0].clientX; // Vị trí X hiện tại
  const touchEndY = e.touches[0].clientY; // Vị trí Y hiện tại
  
  const diffX = touchStartX - touchEndX; // Khoảng cách di chuyển ngang
  const diffY = touchStartY - touchEndY; // Khoảng cách di chuyển dọc

  // Nếu di chuyển ngang nhiều hơn dọc thì cuộn ngang
  if (Math.abs(diffX) > Math.abs(diffY)) {
    e.preventDefault(); // Ngăn scroll mặc định
    container.scrollLeft += diffX * 0.5; // Cuộn ngang với tốc độ giảm
  }
}, { passive: false });

// Khi kết thúc touch
container.addEventListener('touchend', () => {
  touchStartX = 0; // Reset vị trí
  touchStartY = 0;
});

// ===============================================
// PHẦN 14: XỬ LÝ HIỂN THỊ ẢNH
// ===============================================

// Khi ảnh load thành công
mainImage.addEventListener('load', () => {
  const img = mainImage;
  const wrapper = img.parentElement; // Container chứa ảnh
  const displayHeight = window.innerHeight; // Chiều cao màn hình
  
  // Tính toán chiều rộng cần thiết để ảnh full height
  const calculatedWidth = (img.naturalWidth * displayHeight) / img.naturalHeight;
  
  // Set chiều rộng tối thiểu cho wrapper
  wrapper.style.minWidth = calculatedWidth + 'px';
});

// ===============================================
// PHẦN 15: XỬ LÝ LỖI ẢNH VÀ HIỂN THỊ ẢNH THAY THẾ
// ===============================================

// Khi ảnh không load được
mainImage.addEventListener('error', () => {
  console.log('Không thể load ảnh, sử dụng ảnh thay thế');
  
  // Thay thế bằng ảnh lỗi
  mainImage.src = '../images/hỏng trang.jpg'; // Đường dẫn ảnh lỗi
  mainImage.classList.add('error'); // Thêm class để style khác
  
  // Set width mặc định cho wrapper
  const wrapper = mainImage.parentElement;
  wrapper.style.minWidth = '100vw'; // Full width viewport
});

// ===============================================
// PHẦN 16: XỬ LÝ THAY ĐỔI KÍCH THƯỚC CỬA SỔ
// ===============================================

// Khi resize cửa sổ browser
window.addEventListener('resize', () => {
  // Nếu ảnh đã load xong và có kích thước
  if (mainImage.complete && mainImage.naturalHeight > 0) {
    // Tạo sự kiện load giả để tính toán lại kích thước
    const loadEvent = new Event('load');
    mainImage.dispatchEvent(loadEvent);
  }
});

// ===============================================
// PHẦN 17: XỬ LÝ LỖI TOÀN CỤC CHO TRANG WEB
// ===============================================

/**
 * Xử lý lỗi cho tất cả ảnh trên trang
 * Tự động thay thế ảnh bị lỗi bằng ảnh hỏng trang.jpg
 */
function handleImageError() {
  const images = document.querySelectorAll('img');
  images.forEach(img => {
    img.onerror = function() {
      this.src = '../images/hỏng trang.jpg';
      this.alt = 'Ảnh bị lỗi';
    };
  });
}

/**
 * Hiển thị trang lỗi khi có lỗi JavaScript nghiêm trọng
 */
function showErrorPage() {
  document.body.innerHTML = `
    <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
      <img src="../images/hỏng trang.jpg" alt="Trang bị lỗi" style="max-width: 500px; margin-bottom: 20px;">
      <h2 style="color: #e74c3c; margin-bottom: 10px;">Oops! Có lỗi xảy ra</h2>
      <p style="color: #7f8c8d; margin-bottom: 20px;">Trang web gặp sự cố không mong muốn</p>
      <button onclick="location.reload()" style="
        background: #3498db; 
        color: white; 
        border: none; 
        padding: 10px 20px; 
        border-radius: 5px; 
        cursor: pointer;
        font-size: 16px;
      ">Tải lại trang</button>
    </div>
  `;
}

// Xử lý lỗi JavaScript toàn cục
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Lỗi JavaScript:', {
    message: message,
    source: source,
    line: lineno,
    column: colno,
    error: error
  });
  
  // Hiển thị trang lỗi nếu lỗi nghiêm trọng
  if (message.includes('Cannot read') || message.includes('undefined')) {
    showErrorPage();
  }
  
  return true; // Ngăn hiển thị lỗi mặc định của browser
};

// Xử lý lỗi tài nguyên không tải được (CSS, JS, Images...)
window.addEventListener('error', function(e) {
  if (e.target !== window) {
    // Lỗi tải tài nguyên
    console.log('Không thể tải tài nguyên:', e.target.src || e.target.href);
    
    // Nếu là ảnh bị lỗi, thay thế bằng ảnh lỗi
    if (e.target.tagName === 'IMG') {
      e.target.src = '../images/error.jpg';
      e.target.alt = 'Ảnh bị lỗi';
    }
  }
}, true);

// ===============================================
// PHẦN 18: KHỞI TẠO ỨNG DỤNG
// ===============================================

// Khởi tạo xử lý lỗi ảnh khi DOM ready
document.addEventListener('DOMContentLoaded', () => {
  handleImageError(); // Áp dụng xử lý lỗi cho tất cả ảnh
  console.log('Music Player App đã khởi tạo thành công!');
});

// ===============================================
// KẾT THÚC FILE SCRIPT.JS
// ===============================================