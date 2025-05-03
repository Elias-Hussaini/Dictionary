// دیکشنری اولیه
let dictionary = {
    "fa-de": {},
    "de-fa": {}
};

// جهت فعلی جستجو
let currentDirection = "fa-de";

// DOM Elements
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const wordResult = document.getElementById('word-result');
const examplesDiv = document.getElementById('examples');
const faDeBtn = document.getElementById('fa-de');
const deFaBtn = document.getElementById('de-fa');
const newFaInput = document.getElementById('new-fa');
const newDeInput = document.getElementById('new-de');
const newExampleInput = document.getElementById('new-example');
const addWordBtn = document.getElementById('add-word-btn');
const wordCountSpan = document.getElementById('word-count');
// ... کدهای قبلی ...

// DOM Elements جدید
const suggestionsDiv = document.createElement('div');
suggestionsDiv.id = 'suggestions';
document.querySelector('.search-box').appendChild(suggestionsDiv);

// نمایش پیشنهادات
function showSuggestions() {
    const input = searchInput.value.trim().toLowerCase();
    if (input.length < 1) {
        suggestionsDiv.innerHTML = '';
        return;
    }

    const words = Object.keys(dictionary[currentDirection]);
    const matches = words.filter(word => 
        word.startsWith(input) || word.includes(input)
    ).slice(0, 5); // فقط 5 پیشنهاد اول

    suggestionsDiv.innerHTML = matches.length ? 
        matches.map(word => 
            `<div class="suggestion" data-word="${word}">${word}</div>`
        ).join('') : 
        '<div class="no-suggestion">هیچ پیشنهادی یافت نشد</div>';
}

// انتخاب پیشنهاد
function selectSuggestion(word) {
    searchInput.value = word;
    suggestionsDiv.innerHTML = '';
    searchWord();
}

// رویدادهای جدید
searchInput.addEventListener('input', showSuggestions);
suggestionsDiv.addEventListener('click', (e) => {
    if (e.target.classList.contains('suggestion')) {
        selectSuggestion(e.target.dataset.word);
    }
});

// ... بقیه کدهای قبلی ...

// بارگذاری دیکشنری از localStorage
function loadDictionary() {
    const savedDict = localStorage.getItem('persian-german-dictionary');
    if (savedDict) {
        dictionary = JSON.parse(savedDict);
    }
    updateWordCount();
}

// ذخیره دیکشنری در localStorage
function saveDictionary() {
    localStorage.setItem('persian-german-dictionary', JSON.stringify(dictionary));
    updateWordCount();
}

// به روز رسانی تعداد لغات
function updateWordCount() {
    const count = Object.keys(dictionary[currentDirection]).length;
    wordCountSpan.textContent = count;
}

// جستجوی لغت
function searchWord() {
    const word = searchInput.value.trim();
    if (!word) return;

    const result = dictionary[currentDirection][word.toLowerCase()];
    
    if (result) {
        wordResult.innerHTML = `
            <strong>${word}:</strong> ${result.translation}
            ${result.phonetic ? `<br><small>تلفظ: ${result.phonetic}</small>` : ''}
        `;
        
        examplesDiv.innerHTML = result.example ? 
            `<strong>مثال:</strong> ${result.example}` : 
            'مثالی برای این لغت وجود ندارد.';
    } else {
        wordResult.textContent = 'لغت یافت نشد.';
        examplesDiv.textContent = '';
    }
}

// اضافه کردن لغت جدید
function addNewWord() {
    const faWord = newFaInput.value.trim();
    const deWord = newDeInput.value.trim();
    const example = newExampleInput.value.trim();

    if (!faWord || !deWord) {
        alert('لطفاً هر دو لغت فارسی و آلمانی را وارد کنید.');
        return;
    }

    // اضافه به فارسی-آلمانی
    dictionary["fa-de"][faWord.toLowerCase()] = {
        translation: deWord,
        example: example
    };

    // اضافه به آلمانی-فارسی
    dictionary["de-fa"][deWord.toLowerCase()] = {
        translation: faWord,
        example: example
    };

    saveDictionary();
    
    // پاک کردن فرم
    newFaInput.value = '';
    newDeInput.value = '';
    newExampleInput.value = '';
    
    alert('لغت جدید با موفقیت اضافه شد!');
}

// تغییر جهت ترجمه
function changeDirection(direction) {
    currentDirection = direction;
    faDeBtn.classList.toggle('active', direction === 'fa-de');
    deFaBtn.classList.toggle('active', direction === 'de-fa');
    
    searchInput.placeholder = direction === 'fa-de' ? 
        'لغت فارسی را وارد کنید...' : 'Deutsches Wort eingeben...';
    
    // جستجوی مجدد اگر لغتی در جعبه جستجو وجود دارد
    if (searchInput.value.trim()) {
        searchWord();
    }
}

// رویدادها
searchBtn.addEventListener('click', searchWord);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchWord();
});

faDeBtn.addEventListener('click', () => changeDirection('fa-de'));
deFaBtn.addEventListener('click', () => changeDirection('de-fa'));
addWordBtn.addEventListener('click', addNewWord);

// راه‌اندازی PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker ثبت شد با محدوده: ', registration.scope);
            }).catch(err => {
                console.log('ثبت ServiceWorker با خطا مواجه شد: ', err);
            });
    });
}

// بارگذاری اولیه
document.addEventListener('DOMContentLoaded', () => {
    loadDictionary();
    changeDirection('fa-de');
});
// تابع نمایش لغت تصادفی
function showRandomWord() {
    const words = Object.keys(dictionary[currentDirection]);
    if (words.length === 0) {
        wordResult.textContent = "هیچ لغتی برای مرور وجود ندارد!";
        examplesDiv.textContent = "";
        return;
    }
    const randomIndex = Math.floor(Math.random() * words.length);
    const randomWord = words[randomIndex];
    const wordData = dictionary[currentDirection][randomWord];
    
    wordResult.innerHTML = `<strong>${randomWord}:</strong> ${wordData.translation}`;
    examplesDiv.innerHTML = wordData.example ? 
        `<strong>مثال:</strong> ${wordData.example}` : 
        "مثالی برای این لغت وجود ندارد.";
}

// رویداد کلیک دکمه
document.getElementById('random-word-btn').addEventListener('click', showRandomWord);