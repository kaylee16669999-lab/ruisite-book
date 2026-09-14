const book = document.getElementById("book");
const coverScreen = document.getElementById("cover-screen");
const backScreen = document.getElementById("back-screen");
const stage = document.getElementById("stage");
const isMobile = window.innerWidth <= 1024;

// ============ 初始化翻页插件（只加载内页 2~117，共 116 页） ============
const pageFlip = new St.PageFlip(book, {
    width: 900,
    height: 1273,
    size: "fixed",
    showCover: false,
    usePortrait: isMobile,
    drawShadow: true,
    flippingTime: 800,
    mobileScrollSupport: true,
    maxShadowOpacity: 0.15,
    showPageCorners: true,
    useMouseEvents: true,
    swipeDistance: 30
});

let pages = [];
for (let i = 2; i <= 117; i++) {
    pages.push(`page/${i}.jpg`);
}
pageFlip.loadFromImages(pages);

// ============ 状态 ============
let state = "cover";  // "cover" | "book" | "back"

// ============ 下一页 ============
document.getElementById("next-arrow").onclick = function () {
    if (state === "cover") {
        state = "book";
        coverScreen.classList.add("hidden");
        book.style.opacity = "1";
        book.style.visibility = "visible";
        return;
    }
    if (state === "back") return;

    const current = pageFlip.getCurrentPageIndex();
    const total = pageFlip.getPageCount();
    if (current >= total - 2) {
        state = "back";
        backScreen.classList.add("visible");
        book.style.opacity = "0";
        book.style.visibility = "hidden";
        return;
    }
    pageFlip.flipNext();
};

// ============ 上一页 ============
document.getElementById("prev-arrow").onclick = function () {
    if (state === "back") {
        state = "book";
        backScreen.classList.remove("visible");
        book.style.opacity = "1";
        book.style.visibility = "visible";
        return;
    }
    if (state === "book" && pageFlip.getCurrentPageIndex() === 0) {
        state = "cover";
        coverScreen.classList.remove("hidden");
        book.style.opacity = "0";
        book.style.visibility = "hidden";
        return;
    }
    pageFlip.flipPrev();
};

// ============ 键盘（保持不变） ============
document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') document.getElementById("next-arrow").click();
    else if (e.key === 'ArrowLeft') document.getElementById("prev-arrow").click();
});

// ============ 声音 ============
const flipSound = new Audio("sound/flip.mp3");
flipSound.preload = "auto";
pageFlip.on("flip", function () {
    flipSound.currentTime = 0;
    flipSound.play().catch(e => console.log("音频播放被拦截:", e));
});

// ============ 自适应缩放（统一缩放 #stage） ============
function resizeStage() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const stageWidth = 1800;
    const stageHeight = 1273;
    const scaleX = screenWidth / stageWidth;
    const scaleY = screenHeight / stageHeight;
    const scale = Math.min(scaleX, scaleY) * 0.95;

    stage.style.transform = `scale(${scale})`;
    stage.style.transformOrigin = 'center center';
}
window.addEventListener('load', resizeStage);
window.addEventListener('resize', resizeStage);
// ============ 鼠标滚轮翻页 ============
let wheelLock = false; // 防抖锁，防止一次滚动翻多页

document.addEventListener('wheel', function (e) {
    if (wheelLock) return;

    // 锁定 300ms，防止连续触发
    wheelLock = true;
    setTimeout(() => { wheelLock = false; }, 300);

    if (e.deltaY > 0) {
        // 向下滚动 -> 下一页
        document.getElementById("next-arrow").click();
    } else if (e.deltaY < 0) {
        // 向上滚动 -> 上一页
        document.getElementById("prev-arrow").click();
    }
}, { passive: true });