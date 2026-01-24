export ANDROID_EMULATOR_USE_SYSTEM_LIBS=1
QT_QPA_PLATFORM=xcb emulator -avd android_9 -gpu host -no-boot-anim -no-snapshot -no-audio "$@"