// GSAP 开屏动画与预加载
window.addEventListener('load', () => {
    // 隐藏预加载器
    const preloader = document.getElementById('preloader');
    
    gsap.to(preloader, {
        opacity: 0,
        duration: 0.8,
        ease: 'power2.inOut',
        onComplete: () => {
            if (preloader) preloader.style.display = 'none';
            // 预加载器隐藏后，开始开屏动画
            startIntroAnimation();
        }
    });
});

function startIntroAnimation() {
    const tl = gsap.timeline();

    // 初始设置
    gsap.set('.circle-1, .circle-2, .circle-3', { scale: 0.1, opacity: 0 });
    gsap.set('.intro-text', { scale: 0.8, y: 0, opacity: 0 }); // 移除了抖动元凶 letterSpacing
    gsap.set('.intro-overlay', { scale: 1 });
    // 打字机容器初始不可见且有位移
    gsap.set('.typing-topleft-container', { opacity: 0, y: -40 });
    gsap.set('.typing-container', { opacity: 0, y: 40 });
    // 导航栏和按钮初始不可见且有位移
    gsap.set('.navbar-right', { opacity: 0, y: -40 });
    gsap.set('.navbar-left', { opacity: 0, x: -40 });

    // 1. 设定起始标签
    tl.add('start', 0)
    
    // 网格浮现
    .to('.intro-grid', {
        opacity: 0.7,
        duration: 1,
        ease: 'sine.inOut'
    }, 'start')

    // 2. 圆圈快速呼吸式展开（间隔缩短）
    .to('.circle-1', { opacity: 0.5, scale: 1, duration: 0.6, ease: 'expo.out' }, 'start+=0.2')
    .to('.circle-2', { opacity: 0.7, scale: 1, duration: 0.6, ease: 'expo.out' }, 'start+=0.3')
    .to('.circle-3', { opacity: 1, scale: 1, duration: 0.6, ease: 'expo.out' }, 'start+=0.4')

    // 3. 圆圈缓慢旋转（3秒动画，作为背景运动，不影响后续时间轴关键点）
    .to('.circle-1', { rotation: 90, duration: 3, ease: 'none' }, 'start+=0.2')
    .to('.circle-2', { rotation: -60, duration: 3, ease: 'none' }, 'start+=0.2')
    .to('.circle-3', { rotation: 45, duration: 3, ease: 'none' }, 'start+=0.2')

    // 4. WELCOME 文字平滑浮现（纯缩放，不用 letterSpacing 防抖动）
    .to('.intro-text', {
        opacity: 1,
        scale: 1,
        duration: 0.8,
        ease: 'power2.out'
    }, 'start+=0.5')

    // 5. 设定退场标签 
    // 文字在1.3秒完全浮现。停留0.3秒后，即 1.6秒 时开始退场！
    .add('outro', 'start+=1.6')

    // 6. 圆圈从外到内向外扩散退场（3 -> 2 -> 1，波纹感，时间间隔极短）
    .to('.circle-3', { scale: 2.5, opacity: 0, duration: 0.6, ease: 'power2.in' }, 'outro')
    .to('.circle-2', { scale: 3, opacity: 0, duration: 0.6, ease: 'power2.in' }, 'outro+=0.05')
    .to('.circle-1', { scale: 3.5, opacity: 0, duration: 0.6, ease: 'power2.in' }, 'outro+=0.1')

    // 7. 文字与网格同步消散（纯缩放即可产生拉伸感，防止抖动）
    .to('.intro-text', {
        opacity: 0,
        scale: 1.2,
        duration: 0.6,
        ease: 'power3.in'
    }, 'outro+=0.1')
    .to('.intro-grid', {
        opacity: 0,
        scale: 1.1,
        duration: 0.8,
        ease: 'power2.in'
    }, 'outro+=0.1')

    // 8. 遮罩层：中间扩散变淡消失（Dissolve 效果）
    .to('.intro-overlay', {
        scale: 1.2,
        opacity: 0,
        filter: 'blur(20px)',
        duration: 1.0,
        ease: 'power4.inOut',
        onComplete: () => {
            const overlay = document.getElementById('introOverlay');
            if (overlay) overlay.style.display = 'none';
        }
    }, 'outro+=0.2')
    
    // 9. UI 元素优雅滑入（导航栏、侧边按钮、打字机）
    .to('.navbar-right', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out'
    }, 'outro+=0.9')
    .to('.navbar-left', {
        opacity: 1,
        x: 0,
        duration: 1.2,
        ease: 'power3.out'
    }, 'outro+=1.0')
    .to('.typing-topleft-container', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        onStart: startTypedLeft
    }, 'outro+=1.1')
    .to('.typing-container', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        onStart: startTyped
    }, 'outro+=1.1');
}

// 启动打字机特效 - 显示当前时间（右下角）
function startTyped() {
    const typingElement = document.querySelector('.typing');
    
    // 格式化时间函数
    function formatTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        return { hours, minutes, seconds, full: `${hours}:${minutes}:${seconds}` };
    }
    
    // 首次显示时间
    let currentTime = formatTime();
    typingElement.textContent = currentTime.full;
    
    // 每秒更新时间
    setInterval(() => {
        const newTime = formatTime();
        
        // 比较各部分，只更新变化的部分
        if (newTime.seconds !== currentTime.seconds) {
            // 秒变化 - 只更新秒部分
            const secondsPos = 6; // 秒在字符串中的位置
            typingElement.textContent = 
                typingElement.textContent.substring(0, secondsPos) + newTime.seconds;
        }
        
        if (newTime.minutes !== currentTime.minutes) {
            // 分变化 - 更新分和秒部分
            const minutesPos = 3; // 分在字符串中的位置
            typingElement.textContent = 
                typingElement.textContent.substring(0, minutesPos) + newTime.minutes + ':' + newTime.seconds;
        }
        
        if (newTime.hours !== currentTime.hours) {
            // 时变化 - 全部更新
            typingElement.textContent = newTime.full;
        }
        
        currentTime = newTime;
    }, 1000);
}

// 启动打字机特效 - 左上角（循环文字）
function startTypedLeft() {
    var typed = new Typed('.typing-topleft', {
        strings: ["MIKU", "HATSUNE"],
        loop: true,
        typeSpeed: 65,
        backSpeed: 65,
        showCursor: true,
        cursorChar: '|',
        typeCssClass: 'typed-text'
    });
}

// 雨滴效果全局变量
let raindropFx = null;
let isRaindropActive = false;

// 初始化雨滴效果
function initRaindrop() {
    // 已经初始化过则不再重复执行，防止背景视频 loop 时触发 canplay 事件导致反复重启
    if (raindropFx) return;

    const canvas = document.getElementById('raindropCanvas');
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    try {
        // 等待视频加载完成后再截图
        const video = document.querySelector('.video-background video');
        
        // 如果视频还没准备好，使用默认设置
        if (!video.videoWidth) {
            console.log('Video not ready, using default settings');
            // 延迟初始化
            setTimeout(initRaindrop, 500);
            return;
        }
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth || 1920;
        tempCanvas.height = video.videoHeight || 1080;
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const backgroundImage = tempCanvas.toDataURL('image/jpeg');
        
        raindropFx = new RaindropFX({
            canvas: canvas,
            background: backgroundImage,
            gravity: 1200,          // 重力：雨滴下落速度（越小越慢）
            dropletsPerSeconds: 150, // 雨滴数量：每秒雨滴数（越少越稀疏）
            dropletSize: [8, 20],   // 雨滴大小：[最小, 最大]
            trailDropDensity: 0.15, // 轨迹密度：雨滴拖尾（越小越淡）
            mist: true,
            mistBlurStep: 3,        // 雾效模糊：数字越大越模糊 (1-10)
            mistTime: 99999,        // 防止内部默认 10s 的定时擦除重置效果
            backgroundBlurSteps: 3, // 背景模糊：数字越大越模糊 (1-5)
        });

        raindropFx.start();
    } catch (error) {
        console.error('Raindrop init error:', error);
    }
}

// 切换雨滴效果
function toggleRaindrop() {
    const canvas = document.getElementById('raindropCanvas');
    isRaindropActive = !isRaindropActive;
    
    if (isRaindropActive) {
        // 截取当前完整画面（包括视频、打字机等所有元素）
        captureFullScreen().then(backgroundImage => {
            // 更新雨滴背景
            if (raindropFx) {
                raindropFx.stop();
            }
            
            raindropFx = new RaindropFX({
                canvas: canvas,
                background: backgroundImage,
                gravity: 600,            // 降低重力：雨滴下落变慢，显得更平静
                dropletsPerSeconds: 50,  // 降低密度：每秒雨滴变少，不干扰产品视觉
                dropletSize: [8, 20],    // 雨滴大小保持不变
                trailDropDensity: 0.1,   // 稍微降低一点拖尾效果
                mist: true,
                mistBlurStep: 5,        // 雾效模糊：数字越大越模糊 (1-10)
                mistTime: 99999,        // 防止内部默认 10s 的定时擦除重置效果
                backgroundBlurSteps: 3, // 背景模糊：数字越大越模糊 (1-5)
            });
            
            raindropFx.start();
            canvas.classList.add('active');
            // 显示产品面板
            const productsPanel = document.getElementById('productsPanel');
            productsPanel.classList.add('active');
            
            // 使用 GSAP 平滑依次切入卡片
            gsap.fromTo('.product-card', 
                { y: 30, opacity: 0 }, 
                { 
                    y: 0, 
                    opacity: 1, 
                    duration: 0.6, 
                    stagger: 0.1, 
                    ease: 'power3.out', 
                    delay: 0.2,
                    // 关键：入场动画结束后清除 transform 属性，把 transform 控制权还给 CSS :hover
                    clearProps: 'transform' 
                }
            );
        });
    } else {
        canvas.classList.remove('active');
        // 隐藏产品面板
        const productsPanel = document.getElementById('productsPanel');
        productsPanel.classList.remove('active');
        // 清除尚未完成的入场动画，并重置所有的变换内联样式
        gsap.killTweensOf('.product-card');
        gsap.set('.product-card', { clearProps: 'all' });
    }
}

// 截取完整屏幕（包括所有元素）
function captureFullScreen() {
    return new Promise((resolve) => {
        // 临时隐藏雨滴 canvas
        const raindropCanvas = document.getElementById('raindropCanvas');
        const wasActive = raindropCanvas.classList.contains('active');
        raindropCanvas.classList.remove('active');
        
        // 使用 html2canvas 或类似库，或者使用浏览器原生截图 API
        // 这里使用简单的 canvas 绘制方法
        const dpr = window.devicePixelRatio || 1;
        const captureCanvas = document.createElement('canvas');
        captureCanvas.width = window.innerWidth * dpr;
        captureCanvas.height = window.innerHeight * dpr;
        const ctx = captureCanvas.getContext('2d');
        ctx.scale(dpr, dpr);
        
        // 获取视频元素
        const video = document.querySelector('.video-background video');
        
        // 绘制视频帧
        if (video && video.videoWidth) {
            const videoRatio = video.videoWidth / video.videoHeight;
            const screenRatio = window.innerWidth / window.innerHeight;
            let drawWidth, drawHeight, drawX, drawY;
            
            if (screenRatio > videoRatio) {
                drawWidth = window.innerWidth;
                drawHeight = window.innerWidth / videoRatio;
                drawX = 0;
                drawY = (window.innerHeight - drawHeight) / 2;
            } else {
                drawHeight = window.innerHeight;
                drawWidth = window.innerHeight * videoRatio;
                drawX = (window.innerWidth - drawWidth) / 2;
                drawY = 0;
            }
            
            ctx.drawImage(video, drawX, drawY, drawWidth, drawHeight);
        }
        
        // 绘制打字机文字 - 使用与实际 CSS 相同的位置
        drawTextToCanvas(ctx, '.typing-topleft', 50, 50);
        drawTextToCanvas(ctx, '.typing', window.innerWidth - 50, window.innerHeight - 50, 'right', 'bottom');
        
        // 恢复雨滴 canvas 状态
        if (wasActive) {
            raindropCanvas.classList.add('active');
        }
        
        resolve(captureCanvas.toDataURL('image/jpeg', 0.9));
    });
}

// 将文字绘制到 canvas
function drawTextToCanvas(ctx, selector, x, y, align = 'left', baseline = 'top') {
    const element = document.querySelector(selector);
    if (!element) {
        console.log('Element not found:', selector);
        return;
    }
    
    // 获取元素的实际显示文本
    let text = element.textContent || '';
    
    // 对于右下角时间，确保获取当前显示的时间
    if (selector === '.typing') {
        // 直接读取当前显示的时间文本
        text = element.innerText || element.textContent || '';
        console.log('Time text:', text); // 调试用
    }
    
    // 获取光标元素
    let cursorChar = '';
    const parent = element.parentElement;
    if (parent) {
        const cursor = parent.querySelector('.typed-cursor');
        if (cursor && cursor.style.display !== 'none') {
            cursorChar = '|';
        }
    }
    
    // 字体大小与 CSS 一致（56px）
    const fontSize = 56;
    
    ctx.font = `800 ${fontSize}px "General Sans", "Poppins", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = align;
    ctx.textBaseline = baseline;
    
    // 添加文字阴影效果（多层阴影模拟原 CSS 效果）
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 2;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.fillText(text + cursorChar, x, y);
    
    // 重置阴影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
}

// 导航栏交互
document.addEventListener('DOMContentLoaded', () => {
    // 等待视频加载完成后再初始化雨滴效果
    const video = document.querySelector('.video-background video');
    if (video.readyState >= 3) {
        initRaindrop();
    } else {
        video.addEventListener('canplay', initRaindrop);
    }

    const audioIndicator = document.getElementById('audioIndicator');
    const indicatorLines = audioIndicator.querySelectorAll('.indicator-line');
    const bgMusic = document.getElementById('bgMusic');
    let isAudioPlaying = false;

    // 默认音量调到 50%，比较柔和
    if (bgMusic) {
        bgMusic.volume = 0.5;
    }

    // 点击音频指示器切换状态（播放/暂停音乐）
    audioIndicator.addEventListener('click', () => {
        isAudioPlaying = !isAudioPlaying;
        
        if (isAudioPlaying) {
            indicatorLines.forEach((line, index) => {
                line.classList.add('active');
                line.style.animationDelay = `${index * 0.1}s`;
            });
            if (bgMusic) {
                bgMusic.play().catch(e => console.log('Audio play failed:', e));
            }
        } else {
            indicatorLines.forEach(line => {
                line.classList.remove('active');
            });
            if (bgMusic) {
                bgMusic.pause();
            }
        }
    });

    // Products 按钮点击效果 - 切换雨滴
    const productsBtn = document.getElementById('productsBtn');
    const btnText1 = document.getElementById('btnText1');
    const btnText2 = document.getElementById('btnText2');
    
    productsBtn.addEventListener('click', () => {
        toggleRaindrop();
        
        // 添加切换动画类
        productsBtn.classList.add('switching');
        
        // 等待动画开始后再切换文字
        setTimeout(() => {
            if (isRaindropActive) {
                // 冻结界面显示 HOME
                btnText1.textContent = 'Home';
                btnText2.textContent = 'Home';
            } else {
                // 主界面显示 PRODUCTS
                btnText1.textContent = 'Products';
                btnText2.textContent = 'Products';
            }
        }, 200);
        
        // 动画结束后移除类
        setTimeout(() => {
            productsBtn.classList.remove('switching');
        }, 400);
    });

    // 导航链接点击效果
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('href');
            console.log(`Navigating to ${target}`);
            // 可以添加平滑滚动或其他交互
        });
    });
});
