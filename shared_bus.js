/**
 * Trục truyền thông thời gian thực 100% Offline (shared_bus.js)
 * Tác giả: Thầy giáo Trần Mạnh Tùng - THPT Chuyên Thái Nguyên
 */
(function(window) {
    const CHANNEL_NAME = '5c_ai_sync_classroom_channel';
    let channel = null;
    try {
        if (typeof BroadcastChannel !== 'undefined') {
            channel = new BroadcastChannel(CHANNEL_NAME);
        }
    } catch(e) {
        console.warn('BroadcastChannel not available:', e);
    }

    const LESSON_CONFIGS = {
        bai1: { id: 'bai1', title: 'Bài 1: Cấu trúc chất & Thuyết động học phân tử chất khí' },
        bai2: { id: 'bai2', title: 'Bài 2: Định luật Boyle (Quá trình đẳng nhiệt)' },
        bai3: { id: 'bai3', title: 'Bài 3: Thực hành đo nhiệt dung riêng của nước' },
        bai4: { id: 'bai4', title: 'Bài 4: Thực hành đo nhiệt hóa hơi riêng của nước' },
        bai5: { id: 'bai5', title: 'Bài 5: Thực hành đo nhiệt nóng chảy riêng của nước đá' },
        bai6: { id: 'bai6', title: 'Bài 6: Khí thực và phương trình trạng thái Van der Waals' }
    };

    const STEPS_CONFIG = {
        1: { id: 1, name: 'Bước 1: Khởi động', desc: 'Tạo tình huống có vấn đề, phân nhóm và kết nối QR.' },
        2: { id: 2, name: 'Bước 2: Tìm tòi', desc: 'Thực hiện mô phỏng số và thí nghiệm video để thu thập số liệu.' },
        3: { id: 3, name: 'Bước 3: Lập luận', desc: 'Phân tích đồ thị, xử lý sai số và đối thoại mở với AI Socrates.' },
        4: { id: 4, name: 'Bước 4: Thí nghiệm', desc: 'Thực hành ảo, đo đạc thông số thực nghiệm SGK Kết nối tri thức.' },
        5: { id: 5, name: 'Bước 5: Áp dụng', desc: 'Thi đấu Đấu trường Chuông Vàng và báo cáo sản phẩm nhóm.' }
    };

    function getMasterState() {
        try {
            const raw = localStorage.getItem('master_state_5c_ai');
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return {
            activeLesson: 'bai5',
            currentStep: 1,
            isScreenLocked: false,
            timestamp: Date.now()
        };
    }

    function updateMasterState(patch, sender = 'system') {
        const current = getMasterState();
        const updated = Object.assign({}, current, patch, {
            lastSender: sender,
            timestamp: Date.now()
        });
        try {
            localStorage.setItem('master_state_5c_ai', JSON.stringify(updated));
        } catch(e) {}
        if (channel) {
            channel.postMessage({ type: 'MASTER_STATE_UPDATE', state: updated, sender });
        }
        return updated;
    }

    function onMasterStateChange(callback) {
        if (channel) {
            channel.addEventListener('message', (ev) => {
                if (ev.data && ev.data.type === 'MASTER_STATE_UPDATE') {
                    callback(ev.data.state, ev.data.sender);
                }
            });
        }
        window.addEventListener('storage', (ev) => {
            if (ev.key === 'master_state_5c_ai' && ev.newValue) {
                try {
                    callback(JSON.parse(ev.newValue), 'storage_event');
                } catch(e) {}
            }
        });
    }

    function broadcastEvent(eventType, payload = {}) {
        if (channel) {
            channel.postMessage({ type: eventType, payload, timestamp: Date.now() });
        }
    }

    function nextStep() {
        const s = getMasterState();
        let cur = parseInt(s.currentStep) || 1;
        if (cur < 5) {
            cur++;
            updateMasterState({ currentStep: cur }, 'teacher_remote');
        }
        return cur;
    }

    function prevStep() {
        const s = getMasterState();
        let cur = parseInt(s.currentStep) || 1;
        if (cur > 1) {
            cur--;
            updateMasterState({ currentStep: cur }, 'teacher_remote');
        }
        return cur;
    }

    function setStep(stepNum) {
        stepNum = Math.max(1, Math.min(5, parseInt(stepNum) || 1));
        updateMasterState({ currentStep: stepNum }, 'teacher_remote');
        return stepNum;
    }

    function toggleScreenLock() {
        const s = getMasterState();
        const newLock = !s.isScreenLocked;
        updateMasterState({ isScreenLocked: newLock }, 'teacher_remote');
        return newLock;
    }

    function setLesson(lessonId) {
        if (LESSON_CONFIGS[lessonId]) {
            updateMasterState({ activeLesson: lessonId }, 'teacher_remote');
        }
    }

    function toggleFullScreen() {
        try {
            const doc = document;
            const docEl = doc.documentElement;
            const isFull = doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement;
            if (!isFull) {
                const req = docEl.requestFullscreen || docEl.webkitRequestFullscreen || docEl.mozRequestFullScreen || docEl.msRequestFullscreen;
                if (req) req.call(docEl).catch(err => console.warn(err));
            } else {
                const exit = doc.exitFullscreen || doc.webkitExitFullscreen || doc.mozCancelFullScreen || doc.msExitFullscreen;
                if (exit) exit.call(doc);
            }
        } catch (e) {
            console.warn(e);
        }
    }

    window.MASTER_BUS = {
        LESSONS: LESSON_CONFIGS,
        STEPS: STEPS_CONFIG,
        getMasterState,
        updateMasterState,
        onMasterStateChange,
        broadcast: broadcastEvent,
        nextStep,
        prevStep,
        setStep,
        toggleScreenLock,
        setLesson,
        toggleFullScreen
    };
})(window);
