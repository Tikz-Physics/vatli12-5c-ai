@echo off
chcp 65001 >nul
title HỆ THỐNG DẠY HỌC VẬT LÍ 12 - THPT CHUYÊN THÁI NGUYÊN
cls
echo ====================================================================
echo   HỆ THỐNG DẠY HỌC VẬT LÍ 12 – QUY TRÌNH 5 BƯỚC KẾT HỢP AI
echo   Tác giả: Thầy giáo Trần Mạnh Tùng – Bộ môn Vật lí
echo   Đơn vị: Trường THPT Chuyên Thái Nguyên
echo ====================================================================
echo Đang khởi động máy chủ mạng nội bộ phòng học (100%% Offline)...
cd /d "%~dp0"
if exist "Phu_Luc_5_Ma_Nguon_Web_Dashboard\server.js" (
    cd "Phu_Luc_5_Ma_Nguon_Web_Dashboard"
)

node -v >nul 2>&1
if %errorlevel% equ 0 (
    node server.js
) else (
    echo [!] Không tìm thấy Node.js, tự động mở tệp trực tiếp...
    start index.html
)
pause
