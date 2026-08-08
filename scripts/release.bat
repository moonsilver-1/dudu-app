@echo off
REM ============================================================
REM  dudu 一键出 release APK（给同学分发用）
REM  用法：在 dudu-app 目录双击或命令行运行 scripts\release.bat
REM  产物：android\app\build\outputs\apk\release\app-release.apk
REM        并自动拷贝到 D:\dudu-release.apk
REM ============================================================
chcp 65001 >nul
setlocal

set "ROOT=%~dp0.."
set "ANDROID_HOME=D:\AndroidSDK"
set "JAVA_HOME=D:\JDK17\jdk17.0.20_8"

echo.
echo [1/3] 重新生成内容（content.json + 样式）...
cd /d "%ROOT%"
call npm run build:content
if errorlevel 1 (
  echo 内容构建失败，已终止。
  exit /b 1
)

echo.
echo [2/3] 编译 release APK（约 1-3 分钟）...
cd /d "%ROOT%\android"
call gradlew.bat assembleRelease --console=plain
if errorlevel 1 (
  echo APK 编译失败，已终止。
  exit /b 1
)

echo.
echo [3/3] 拷贝到 D:\dudu-release.apk ...
copy /y "%ROOT%\android\app\build\outputs\apk\release\app-release.apk" "D:\dudu-release.apk" >nul

echo.
echo ============================================================
echo  ✅ 完成！新 APK: D:\dudu-release.apk
echo  把这个文件发给同学覆盖安装即可（收藏/进度会保留）。
echo ============================================================
echo.
endlocal
