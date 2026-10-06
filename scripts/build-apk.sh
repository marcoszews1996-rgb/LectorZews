#!/bin/bash
set -e

echo "=== Building Android APK for LectorZews ==="

# 0. Ensure Android 13 (API 33) Platform JAR is available
if [ ! -f /tmp/android-33.jar ]; then
  echo "Downloading Android 13 (API 33) platform JAR..."
  curl -s -L -o /tmp/android-33.jar https://raw.githubusercontent.com/Sable/android-platforms/master/android-33/android.jar
fi
ANDROID_JAR=/tmp/android-33.jar

# 1. Symlink dx
ln -sf /usr/bin/dalvik-exchange /usr/local/bin/dx || true

# 2. Prepare directories
rm -rf /tmp/lectorzews-build
mkdir -p /tmp/lectorzews-build/gen
mkdir -p /tmp/lectorzews-build/bin
mkdir -p /tmp/lectorzews-build/assets
mkdir -p android/app/src/main/res/mipmap-{mdpi,hdpi,xhdpi,xxhdpi,xxxhdpi}

# 3. Copy launcher icons
cp public/pwa-192x192.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png
cp public/pwa-512x512.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png
cp public/pwa-192x192.png android/app/src/main/res/mipmap-hdpi/ic_launcher.png
cp public/pwa-192x192.png android/app/src/main/res/mipmap-mdpi/ic_launcher.png
cp public/pwa-192x192.png android/app/src/main/res/mipmap-xhdpi/ic_launcher.png

cp public/pwa-maskable-512x512.png android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png
cp public/pwa-192x192.png android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png
cp public/pwa-192x192.png android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png
cp public/pwa-192x192.png android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png
cp public/pwa-192x192.png android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png

# 4. Copy web production assets into assets/ folder (excluding any APK or ZIP binaries)
echo "Copying web dist into assets..."
cp -r dist/* /tmp/lectorzews-build/assets/
rm -f /tmp/lectorzews-build/assets/*.apk* /tmp/lectorzews-build/assets/*.zip* 2>/dev/null || true
mkdir -p android/app/src/main/assets
cp -r dist/* android/app/src/main/assets/
rm -f android/app/src/main/assets/*.apk* android/app/src/main/assets/*.zip* 2>/dev/null || true

# 5. Generate R.java with aapt for Android 13+
echo "Generating R.java for Android 13+ (API 33)..."
aapt package -f -m \
  -J /tmp/lectorzews-build/gen \
  -M android/app/src/main/AndroidManifest.xml \
  -S android/app/src/main/res \
  -I $ANDROID_JAR

# 6. Compile Java sources
echo "Compiling Java with javac against Android 13..."
javac -source 8 -target 8 \
  -d /tmp/lectorzews-build/bin \
  -classpath $ANDROID_JAR:/tmp/lectorzews-build/gen \
  /tmp/lectorzews-build/gen/com/lectorzews/app/R.java \
  android/app/src/main/java/com/lectorzews/app/MainActivity.java

# 7. Convert bytecode to Dalvik executable (classes.dex)
echo "Compiling to classes.dex..."
dalvik-exchange --dex --output=/tmp/lectorzews-build/bin/classes.dex /tmp/lectorzews-build/bin

# 8. Package unaligned APK with aapt
echo "Packaging unaligned APK with Android 13 (minSdk 33)..."
aapt package -f \
  -M android/app/src/main/AndroidManifest.xml \
  -S android/app/src/main/res \
  -A /tmp/lectorzews-build/assets \
  -I $ANDROID_JAR \
  -F /tmp/lectorzews-build/unaligned.apk \
  /tmp/lectorzews-build/bin

# 9. Align APK
echo "Aligning APK with zipalign..."
zipalign -f 4 /tmp/lectorzews-build/unaligned.apk /tmp/lectorzews-build/aligned.apk

# 10. Generate keystore if needed
if [ ! -f /tmp/lectorzews-debug.keystore ]; then
  echo "Generating debug keystore..."
  keytool -genkeypair -v \
    -keystore /tmp/lectorzews-debug.keystore \
    -alias lectorzews \
    -keyalg RSA \
    -keysize 2048 \
    -validity 10000 \
    -storepass lectorzews123 \
    -keypass lectorzews123 \
    -dname "CN=LectorZews, OU=Mobile, O=LectorZews, L=Madrid, ST=Madrid, C=ES"
fi

# 11. Sign APK with apksigner (min-sdk 33 for Android 13+)
echo "Signing APK with apksigner (Android 13+)..."
mkdir -p public dist
apksigner sign \
  --ks /tmp/lectorzews-debug.keystore \
  --ks-pass pass:lectorzews123 \
  --ks-key-alias lectorzews \
  --key-pass pass:lectorzews123 \
  --min-sdk-version 33 \
  --out public/LectorZews.apk \
  /tmp/lectorzews-build/aligned.apk

# 12. Copy APK to root directory outside of folders, and to dist
cp public/LectorZews.apk ./LectorZews.apk
cp public/LectorZews.apk dist/LectorZews.apk

# 13. Verify APK signature and SDK version
echo "Verifying APK..."
apksigner verify -v ./LectorZews.apk

# 14. Create a complete zip of the Android Studio project for developers
echo "Creating full Android Studio project ZIP..."
python3 -c "import shutil; shutil.make_archive('public/lectorzews-android-project', 'zip', 'android')" || true
cp public/lectorzews-android-project.zip ./lectorzews-android-project.zip 2>/dev/null || true

echo "=== APK Successfully Built for Android 13+ (minSdk 33) ==="
ls -lh ./LectorZews.apk
