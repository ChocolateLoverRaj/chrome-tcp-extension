@echo off
setlocal
cd /d "%~dp0"
node "setupNative.js"
REG ADD "HKCU\Software\Google\Chrome\NativeMessagingHosts\com.chocolateloverraj.tcp" /ve /t REG_SZ /d "%~dp0native.json" /f
