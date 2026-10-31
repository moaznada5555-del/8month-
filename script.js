document.addEventListener("DOMContentLoaded", () => {
    // 1. الورود المتحركة
    const rosesContainer = document.getElementById("floatingRoses");
    const roseIcons = ["🌸", "🌹", "🌷"];
    setInterval(() => {
        const rose = document.createElement("div");
        rose.classList.add("rose-icon");
        rose.innerText = roseIcons[Math.floor(Math.random() * roseIcons.length)];
        rose.style.left = Math.random() * 100 + "vw";
        rose.style.animationDuration = Math.random() * 5 + 7 + "s";
        rose.style.fontSize = Math.random() * 10 + 15 + "px";
        rosesContainer.appendChild(rose);
        setTimeout(() => rose.remove(), 12000);
    }, 600);

    document.getElementById("scrollToUnlock").addEventListener("click", () => {
        document.querySelector(".date-gate-section").scrollIntoView({ behavior: 'smooth' });
    });

    // 2. بوابة التاريخ
    const unlockBtn = document.getElementById("unlockBtn");
    const dateInput = document.getElementById("dateInput");
    const mainContent = document.getElementById("mainContent");
    const dateGateSection = document.querySelector(".date-gate-section");
    const dateErrorMessage = document.getElementById("dateErrorMessage");
    const CORRECT_DATE = "21/2/2026";

    unlockBtn.addEventListener("click", () => {
        const val = dateInput.value.trim();
        if (val === CORRECT_DATE || val === "21/02/2026") {
            dateGateSection.classList.add("hidden");
            mainContent.classList.remove("hidden");
            window.scrollTo({ top: 0, behavior: 'smooth' });
            loadDynamicMedia();
        } else {
            dateErrorMessage.classList.remove("hidden");
        }
    });

    // 3. إدارة رفع وتحميل الوسائط (صور، فيديوهات، وأغنية) عبر لوحة التحكم
    const uploadImagesInput = document.getElementById("uploadImages");
    const uploadVideosInput = document.getElementById("uploadVideos");
    const uploadMusicInput = document.getElementById("uploadMusic");
    const resetMediaBtn = document.getElementById("resetMediaBtn");

    let savedImages = JSON.parse(localStorage.getItem("wardna_custom_images")) || [];
    let savedVideos = JSON.parse(localStorage.getItem("wardna_custom_videos")) || [];
    let savedMusic = localStorage.getItem("wardna_custom_music") || "";

    // رفع الصور وتحويلها لـ Base64 لتخزينها محلياً
    uploadImagesInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                savedImages.push(event.target.result);
                localStorage.setItem("wardna_custom_images", JSON.stringify(savedImages));
                renderGallery();
            };
            reader.readAsDataURL(file);
        });
    });

    // رفع الفيديوهات
    uploadVideosInput.addEventListener("change", (e) => {
        const files = Array.from(e.target.files);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                savedVideos.push(event.target.result);
                localStorage.setItem("wardna_custom_videos", JSON.stringify(savedVideos));
                renderGallery();
            };
            reader.readAsDataURL(file);
        });
    });

    // رفع الأغنية
    uploadMusicInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                savedMusic = event.target.result;
                localStorage.setItem("wardna_custom_music", savedMusic);
                setupAudioPlayer();
                alert("✅ تم تغيير الأغنية بنجاح!");
            };
            reader.readAsDataURL(file);
        }
    });

    // زر إعادة الضبط
    resetMediaBtn.addEventListener("click", () => {
        if (confirm("هل تريد مسح الوسائط المرفوعة والعودة للوضع الافتراضي؟")) {
            localStorage.removeItem("wardna_custom_images");
            localStorage.removeItem("wardna_custom_videos");
            localStorage.removeItem("wardna_custom_music");
            savedImages = [];
            savedVideos = [];
            savedMusic = "";
            renderGallery();
            setupAudioPlayer();
            alert("🔄 تم إعادة الضبط.");
        }
    });

    function renderGallery() {
        const imagesGrid = document.getElementById("imagesGrid");
        const videosGrid = document.getElementById("videosGrid");
        imagesGrid.innerHTML = "";
        videosGrid.innerHTML = "";

        // عرض الصور
        if (savedImages.length === 0) {
            imagesGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">لم تقم برفع صور بعد. استخدم لوحة التحكم بالأعلى لإضافة صورك!</p>`;
        } else {
            savedImages.forEach((src) => {
                const item = document.createElement("div");
                item.className = "media-item";
                item.innerHTML = `<img src="${src}" alt="صورة ذكرى" loading="lazy">`;
                item.addEventListener("click", () => openLightbox(src));
                imagesGrid.appendChild(item);
            });
        }

        // عرض الفيديوهات
        if (savedVideos.length === 0) {
            videosGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #888;">لم تقم برفع فيديوهات بعد.</p>`;
        } else {
            savedVideos.forEach((src) => {
                const item = document.createElement("div");
                item.className = "media-item";
                item.innerHTML = `<video src="${src}" controls preload="metadata"></video>`;
                videosGrid.appendChild(item);
            });
        }
    }

    // تبديل تبويبات المعرض
    const tabLinks = document.querySelectorAll(".tab-link");
    tabLinks.forEach(link => {
        link.addEventListener("click", () => {
            tabLinks.forEach(l => l.classList.remove("active"));
            link.classList.add("active");
            const type = link.getAttribute("data-type");
            if (type === "images") {
                document.getElementById("imagesGrid").classList.remove("hidden");
                document.getElementById("videosGrid").classList.add("hidden");
            } else {
                document.getElementById("imagesGrid").classList.add("hidden");
                document.getElementById("videosGrid").classList.remove("hidden");
            }
        });
    });

    function loadDynamicMedia() {
        renderGallery();
        setupAudioPlayer();
    }

    // 4. إعداد مشغل الأغنية (لمدة دقيقة كحد أقصى)
    const audioElement = document.getElementById("audioElement");
    const playPauseBtn = document.getElementById("playPauseBtn");
    const vinylRecord = document.querySelector(".vinyl-record");
    const progressBar = document.getElementById("progressBar");
    const progressBarContainer = document.getElementById("progressBarContainer");
    const currentTimeEl = document.getElementById("currentTime");

    function setupAudioPlayer() {
        if (savedMusic) {
            audioElement.src = savedMusic;
        } else {
            audioElement.src = "./media/music.mp3"; // الافتراضي
        }
    }

    playPauseBtn.addEventListener("click", () => {
        if (audioElement.paused) {
            audioElement.play();
            playPauseBtn.innerText = "⏸";
            vinylRecord.classList.add("spinning");
        } else {
            audioElement.pause();
            playPauseBtn.innerText = "▶";
            vinylRecord.classList.remove("spinning");
        }
    });

    audioElement.addEventListener("timeupdate", () => {
        const current = audioElement.currentTime;
        const duration = 60; // دقيقة واحدة
        if (current >= 60) {
            audioElement.pause();
            audioElement.currentTime = 0;
            playPauseBtn.innerText = "▶";
            vinylRecord.classList.remove("spinning");
            return;
        }
        const percent = (current / duration) * 100;
        progressBar.style.width = percent + "%";
        let mins = Math.floor(current / 60);
        let secs = Math.floor(current % 60);
        currentTimeEl.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    });

    progressBarContainer.addEventListener("click", (e) => {
        const width = progressBarContainer.clientWidth;
        const clickX = e.offsetX;
        audioElement.currentTime = (clickX / width) * 60;
    });

    // 5. اللايت بوكس
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const closeLightbox = document.getElementById("closeLightbox");

    function openLightbox(src) {
        lightboxImg.src = src;
        lightbox.classList.remove("hidden");
        document.body.style.overflow = "hidden";
    }

    closeLightbox.addEventListener("click", () => {
        lightbox.classList.add("hidden");
        document.body.style.overflow = "";
    });

    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) {
            lightbox.classList.add("hidden");
            document.body.style.overflow = "";
        }
    });

    // 6. لعبة الـ 10 أسئلة
    const questions = [
        "أكتر صفة بتحبيها فيا؟",
        "أكلة نِفسك ناكلها سوا؟",
        "أكتر ذكرى بتضحكك لينا؟",
        "كلمة دايماً بنقولها لبعض؟",
        "أغنية بتفكرك بيا؟",
        "أكتر حاجة بتطمنك في وجودي؟",
        "عادة غريبة فيا بس متقبلاها؟",
        "مكان نِفسك نسافر له مع بعض؟",
        "أول انطباع ليكي عني؟",
        "وعد نِفسك نوعده لبعض؟"
    ];

    const questionsContainer = document.getElementById("questionsInputList");
    const btnPlayer1 = document.getElementById("btnPlayer1");
    const btnPlayer2 = document.getElementById("btnPlayer2");
    const answersForm = document.getElementById("answersForm");
    const gameStatus = document.getElementById("gameStatus");

    let currentVisiblePlayer = "player1";
    let allAnswers = JSON.parse(localStorage.getItem("wardna_game_answers")) || { player1: {}, player2: {} };

    function renderQuestions() {
        questionsContainer.innerHTML = "";
        questions.forEach((qText, index) => {
            const qKey = `q_${index + 1}`;
            const savedValue = allAnswers[currentVisiblePlayer][qKey] || "";
            const group = document.createElement("div");
            group.className = "question-group";
            group.innerHTML = `<label>${index + 1}. ${qText}</label><input type="text" name="${qKey}" value="${savedValue}" placeholder="اكتبي الإجابة هنا...">`;
            questionsContainer.appendChild(group);
        });
    }

    function switchPlayer(player) {
        saveCurrentVisibleInputs();
        currentVisiblePlayer = player;
        btnPlayer1.classList.toggle("active", player === "player1");
        btnPlayer2.classList.toggle("active", player === "player2");
        renderQuestions();
    }

    btnPlayer1.addEventListener("click", () => switchPlayer("player1"));
    btnPlayer2.addEventListener("click", () => switchPlayer("player2"));

    function saveCurrentVisibleInputs() {
        const formData = new FormData(answersForm);
        if (!allAnswers[currentVisiblePlayer]) allAnswers[currentVisiblePlayer] = {};
        for (let [key, value] of formData.entries()) {
            allAnswers[currentVisiblePlayer][key] = value;
        }
    }

    answersForm.addEventListener("submit", (e) => {
        e.preventDefault();
        saveCurrentVisibleInputs();
        localStorage.setItem("wardna_game_answers", JSON.stringify(allAnswers));
        gameStatus.innerText = "✅ تم حفظ جميع الإجابات بأمان في متصفحك!";
        setTimeout(() => { gameStatus.innerText = ""; }, 4000);
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
        saveCurrentVisibleInputs();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(allAnswers, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "حكايتنا_إجابات_اللعبة.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    document.getElementById("importInput").addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const importedData = JSON.parse(event.target.result);
                if (importedData.player1 && importedData.player2) {
                    allAnswers = importedData;
                    localStorage.setItem("wardna_game_answers", JSON.stringify(allAnswers));
                    renderQuestions();
                    gameStatus.innerText = "📥 تم استيراد الإجابات بنجاح!";
                    setTimeout(() => { gameStatus.innerText = ""; }, 4000);
                } else {
                    alert("الملف المرفوع غير صالح.");
                }
            } catch (err) { alert("حدث خطأ أثناء قراءة الملف."); }
        };
        reader.readAsText(file);
    });

    renderQuestions();
});