// Từ vựng theo chủ đề. Mỗi mục: en (tiếng Anh), vi (nghĩa), và một kiểu hình:
// emoji | color (ô màu) | svg + fill (hình khối) | n (số đếm).
// say: câu đọc thêm sau từ (tiếng kêu...), speech: thay toàn bộ câu đọc ở chế độ Học.
// plural: danh từ số nhiều -> hỏi "Where are the ...?"

(function () {
  const NUM_EN = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const NUM_VI = ['một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín', 'mười'];
  const NUM_EMOJI = ['🍎', '🐥', '⭐', '🎈', '🐟', '🍓', '🦋', '🌸', '🚗', '🍪'];

  window.SHAPES_SVG = {
    circle: '<circle cx="50" cy="50" r="42"/>',
    square: '<rect x="10" y="10" width="80" height="80" rx="6"/>',
    triangle: '<polygon points="50,8 95,88 5,88" stroke-linejoin="round"/>',
    star: '<polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38"/>',
    heart: '<path d="M50 88C20 66 6 50 6 32 6 18 17 8 30 8c10 0 16 6 20 14 4-8 10-14 20-14 13 0 24 10 24 24 0 18-14 34-44 56z"/>',
    rectangle: '<rect x="4" y="24" width="92" height="52" rx="6"/>',
    oval: '<ellipse cx="50" cy="50" rx="45" ry="30"/>',
    diamond: '<polygon points="50,4 92,50 50,96 8,50"/>'
  };

  window.TOPICS = [
    {
      id: 'animals', en: 'Animals', vi: 'Con vật', icon: '🐶', tint: '#ffd6a5',
      items: [
        { en: 'dog', vi: 'con chó', emoji: '🐶' },
        { en: 'cat', vi: 'con mèo', emoji: '🐱' },
        { en: 'cow', vi: 'con bò', emoji: '🐮' },
        { en: 'duck', vi: 'con vịt', emoji: '🦆' },
        { en: 'pig', vi: 'con lợn', emoji: '🐷' },
        { en: 'chicken', vi: 'con gà', emoji: '🐔' },
        { en: 'sheep', vi: 'con cừu', emoji: '🐑' },
        { en: 'horse', vi: 'con ngựa', emoji: '🐴' },
        { en: 'lion', vi: 'sư tử', emoji: '🦁' },
        { en: 'elephant', vi: 'con voi', emoji: '🐘' },
        { en: 'monkey', vi: 'con khỉ', emoji: '🐵' },
        { en: 'bird', vi: 'con chim', emoji: '🐦' },
        { en: 'fish', vi: 'con cá', emoji: '🐟' },
        { en: 'rabbit', vi: 'con thỏ', emoji: '🐰' },
        { en: 'frog', vi: 'con ếch', emoji: '🐸' },
        { en: 'bear', vi: 'con gấu', emoji: '🐻' }
      ]
    },
    {
      id: 'colors', en: 'Colors', vi: 'Màu sắc', icon: '🎨', tint: '#ffc6d9',
      items: [
        { en: 'red', vi: 'màu đỏ', color: '#ef4444' },
        { en: 'blue', vi: 'xanh dương', color: '#3b82f6' },
        { en: 'yellow', vi: 'màu vàng', color: '#facc15' },
        { en: 'green', vi: 'xanh lá', color: '#22c55e' },
        { en: 'orange', vi: 'màu cam', color: '#f97316' },
        { en: 'purple', vi: 'màu tím', color: '#a855f7' },
        { en: 'pink', vi: 'màu hồng', color: '#f472b6' },
        { en: 'brown', vi: 'màu nâu', color: '#92400e' },
        { en: 'black', vi: 'màu đen', color: '#1f2937' },
        { en: 'white', vi: 'màu trắng', color: '#ffffff' }
      ]
    },
    {
      id: 'numbers', en: 'Numbers', vi: 'Số đếm', icon: '🔢', tint: '#caffbf',
      items: NUM_EN.map((w, i) => ({
        en: w, vi: 'số ' + NUM_VI[i], n: i + 1, emoji: NUM_EMOJI[i],
        speech: NUM_EN.slice(0, i + 1).join(', ') + '... ' + w + '!'
      }))
    },
    {
      id: 'fruits', en: 'Fruits', vi: 'Hoa quả', icon: '🍎', tint: '#fdffb6',
      items: [
        { en: 'apple', vi: 'quả táo', emoji: '🍎' },
        { en: 'banana', vi: 'quả chuối', emoji: '🍌' },
        { en: 'orange', vi: 'quả cam', emoji: '🍊' },
        { en: 'grapes', vi: 'quả nho', emoji: '🍇', plural: true },
        { en: 'watermelon', vi: 'dưa hấu', emoji: '🍉' },
        { en: 'strawberry', vi: 'dâu tây', emoji: '🍓' },
        { en: 'mango', vi: 'quả xoài', emoji: '🥭' },
        { en: 'pineapple', vi: 'quả dứa', emoji: '🍍' },
        { en: 'pear', vi: 'quả lê', emoji: '🍐' },
        { en: 'cherry', vi: 'anh đào', emoji: '🍒' },
        { en: 'lemon', vi: 'quả chanh', emoji: '🍋' },
        { en: 'coconut', vi: 'quả dừa', emoji: '🥥' }
      ]
    },
    {
      id: 'shapes', en: 'Shapes', vi: 'Hình khối', icon: '🔷', tint: '#9bf6ff',
      items: [
        { en: 'circle', vi: 'hình tròn', svg: 'circle', fill: '#ef4444' },
        { en: 'square', vi: 'hình vuông', svg: 'square', fill: '#3b82f6' },
        { en: 'triangle', vi: 'hình tam giác', svg: 'triangle', fill: '#22c55e' },
        { en: 'star', vi: 'ngôi sao', svg: 'star', fill: '#facc15' },
        { en: 'heart', vi: 'trái tim', svg: 'heart', fill: '#f472b6' },
        { en: 'rectangle', vi: 'hình chữ nhật', svg: 'rectangle', fill: '#f97316' },
        { en: 'oval', vi: 'hình bầu dục', svg: 'oval', fill: '#a855f7' },
        { en: 'diamond', vi: 'hình thoi', svg: 'diamond', fill: '#06b6d4' }
      ]
    },
    {
      id: 'body', en: 'My Body', vi: 'Cơ thể', icon: '👀', tint: '#ffcfd2',
      items: [
        { en: 'eyes', vi: 'đôi mắt', emoji: '👀', plural: true },
        { en: 'nose', vi: 'cái mũi', emoji: '👃' },
        { en: 'mouth', vi: 'cái miệng', emoji: '👄' },
        { en: 'ear', vi: 'cái tai', emoji: '👂' },
        { en: 'hand', vi: 'bàn tay', emoji: '✋' },
        { en: 'foot', vi: 'bàn chân', emoji: '🦶' },
        { en: 'leg', vi: 'cái chân', emoji: '🦵' },
        { en: 'teeth', vi: 'răng', emoji: '🦷', plural: true },
        { en: 'tongue', vi: 'cái lưỡi', emoji: '👅' }
      ]
    },
    {
      // Tính từ nên hỏi "Who is happy?" thay vì "Where is the ...?"
      id: 'feelings', en: 'Feelings', vi: 'Cảm xúc', icon: '😄', tint: '#ffe58f',
      ask: 'who', askVi: 'Bạn nào đang {vi}?',
      items: [
        { en: 'happy', vi: 'vui', emoji: '😄' },
        { en: 'sad', vi: 'buồn', emoji: '😢' },
        { en: 'angry', vi: 'tức giận', emoji: '😠' },
        { en: 'sleepy', vi: 'buồn ngủ', emoji: '😴' },
        { en: 'scared', vi: 'sợ hãi', emoji: '😨' },
        { en: 'surprised', vi: 'ngạc nhiên', emoji: '😮' },
        { en: 'tired', vi: 'mệt', emoji: '😩' },
        { en: 'sick', vi: 'bị ốm', emoji: '🤒' },
        { en: 'hot', vi: 'nóng', emoji: '🥵' },
        { en: 'cold', vi: 'lạnh', emoji: '🥶' }
      ]
    },
    {
      id: 'vehicles', en: 'Vehicles', vi: 'Xe cộ', icon: '🚗', tint: '#a0c4ff',
      items: [
        { en: 'car', vi: 'ô tô', emoji: '🚗', say: 'Beep beep!' },
        { en: 'bus', vi: 'xe buýt', emoji: '🚌' },
        { en: 'motorbike', vi: 'xe máy', emoji: '🛵', say: 'Vroom vroom!' },
        { en: 'bike', vi: 'xe đạp', emoji: '🚲', say: 'Ring ring!' },
        { en: 'train', vi: 'tàu hỏa', emoji: '🚂', say: 'Choo choo!' },
        { en: 'airplane', vi: 'máy bay', emoji: '✈️' },
        { en: 'boat', vi: 'cái thuyền', emoji: '⛵' },
        { en: 'truck', vi: 'xe tải', emoji: '🚚' },
        { en: 'helicopter', vi: 'trực thăng', emoji: '🚁' },
        { en: 'fire truck', vi: 'xe cứu hỏa', emoji: '🚒' },
        { en: 'ambulance', vi: 'xe cứu thương', emoji: '🚑' }
      ]
    },
    {
      id: 'food', en: 'Food', vi: 'Đồ ăn', icon: '🥛', tint: '#fde2c0',
      items: [
        { en: 'milk', vi: 'sữa', emoji: '🥛' },
        { en: 'water', vi: 'nước', emoji: '💧' },
        { en: 'rice', vi: 'cơm', emoji: '🍚' },
        { en: 'bread', vi: 'bánh mì', emoji: '🍞' },
        { en: 'egg', vi: 'quả trứng', emoji: '🥚' },
        { en: 'cake', vi: 'bánh ngọt', emoji: '🎂' },
        { en: 'ice cream', vi: 'kem', emoji: '🍦' },
        { en: 'cookie', vi: 'bánh quy', emoji: '🍪' },
        { en: 'carrot', vi: 'cà rốt', emoji: '🥕' },
        { en: 'corn', vi: 'bắp ngô', emoji: '🌽' }
      ]
    },
    {
      id: 'things', en: 'My Things', vi: 'Đồ vật', icon: '🧸', tint: '#e2d4ff',
      items: [
        { en: 'ball', vi: 'quả bóng', emoji: '⚽' },
        { en: 'teddy bear', vi: 'gấu bông', emoji: '🧸' },
        { en: 'book', vi: 'quyển sách', emoji: '📖' },
        { en: 'bed', vi: 'cái giường', emoji: '🛏️' },
        { en: 'chair', vi: 'cái ghế', emoji: '🪑' },
        { en: 'shoes', vi: 'đôi giày', emoji: '👟', plural: true },
        { en: 'hat', vi: 'cái mũ', emoji: '👒' },
        { en: 'cup', vi: 'cái cốc', emoji: '🥤' },
        { en: 'spoon', vi: 'cái thìa', emoji: '🥄' },
        { en: 'toothbrush', vi: 'bàn chải đánh răng', emoji: '🪥' },
        { en: 'umbrella', vi: 'cái ô', emoji: '☂️' },
        { en: 'balloon', vi: 'bóng bay', emoji: '🎈' }
      ]
    },
    {
      id: 'nature', en: 'Nature', vi: 'Thiên nhiên', icon: '🌈', tint: '#c7f9cc',
      items: [
        { en: 'sun', vi: 'mặt trời', emoji: '☀️' },
        { en: 'moon', vi: 'mặt trăng', emoji: '🌙' },
        { en: 'star', vi: 'ngôi sao', emoji: '⭐' },
        { en: 'cloud', vi: 'đám mây', emoji: '☁️' },
        { en: 'rain', vi: 'mưa', emoji: '🌧️' },
        { en: 'rainbow', vi: 'cầu vồng', emoji: '🌈' },
        { en: 'tree', vi: 'cái cây', emoji: '🌳' },
        { en: 'flower', vi: 'bông hoa', emoji: '🌸' },
        { en: 'leaf', vi: 'chiếc lá', emoji: '🍃' }
      ]
    }
  ];
})();
