@echo off
REM ============================================================
REM  dudu 一键发布新版本（出 APK + 推 GitHub Release + 更新 version.json）
REM
REM  用法：
REM    1. 先改 android/app/build.gradle 里的 versionCode 和 versionName
REM    2. 同步改 src/lib/update.ts 里的 LOCAL_VERSION / LOCAL_VERSION_CODE
REM    3. 改 version.json（版本号、url 指向新 tag、changelog）
REM    4. 双击运行本脚本，或命令行：scripts\release.bat
REM
REM  产物：
REM    - 本地：D:\dudu-release.apk
REM    - GitHub Release：新 tag，自动上传 APK
REM    - 仓库 version.json 更新（App 通过 jsDelivr CDN 读取）
REM ============================================================
chcp 65001 >nul
setlocal enabledelayedexpansion

set "ROOT=%~dp0.."
set "ANDROID_HOME=D:\AndroidSDK"
set "JAVA_HOME=D:\JDK17\jdk17.0.20_8"
set "APK_OUT=%ROOT%\android\app\build\outputs\apk\release\app-release.apk"
set "DST=D:\dudu-release.apk"

REM ---- 从 build.gradle 读 versionName ----
for /f "tokens=2 delims==" %%a in ('findstr /c:"versionName" "%ROOT%\android\app\build.gradle"') do (
  set "vraw=%%a"
)
REM 去掉引号和空格
set "vraw=%vraw:"=%"
set "vraw=%vraw: =%"
set "VER=%vraw:~0,-1%"
if "%VER%"=="" set "VER=x.x.x"

echo.
echo ============================================================
echo   发布版本: v%VER%
echo ============================================================

echo.
echo [1/5] 重新生成内容（content.json + 样式）...
cd /d "%ROOT%"
call npm run build:content
if errorlevel 1 ( echo 内容构建失败。& exit /b 1 )

echo.
echo [2/5] 编译 release APK（约 1-3 分钟）...
cd /d "%ROOT%\android"
call gradlew.bat assembleRelease --console=plain
if errorlevel 1 ( echo APK 编译失败。& exit /b 1 )

echo.
echo [3/5] 拷贝 APK 到 %DST% ...
copy /y "%APK_OUT%" "%DST%" >nul

echo.
echo [4/5] 提交代码 + version.json 推送到 GitHub...
cd /d "%ROOT%"
git add -A
git commit -m "release: v%VER%" 2>nul
git push
if errorlevel 1 ( echo 推送失败，请检查网络/git 配置。& exit /b 1 )

echo.
echo [5/5] 创建 GitHub Release v%VER% 并上传 APK...
call gh release create "v%VER%" "%DST%" --title "嘟嘟 DUDU v%VER%" --notes "v%VER% 更新，从 App 内\"我的→检查更新\"即可获取。"
if errorlevel 1 ( echo Release 创建失败（可能 gh 未登录，或该 tag 已存在）。& exit /b 1 )

echo.
echo ============================================================
echo   ✅ 发布完成！v%VER%
echo.
echo   下载页：https://github.com/moonsilver-1/dudu-app/releases/tag/v%VER%
echo   直接链接：https://github.com/moonsilver-1/dudu-app/releases/download/v%VER%/dudu-release.apk
echo.
echo   把上面链接发群里，同学点开下载安装即可。
echo   已装旧版的人，App 内"我的→检查更新"会自动提示新版。
echo ============================================================
echo.
endlocal
