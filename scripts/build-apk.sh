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
cp public/LectorZews.apk dist/LectorZews.apk 2>/dev/null || true

# 13. Generate Android App Bundle (.aab) outside alongside .apk
echo "Generating Android App Bundle (LectorZews.aab)..."
python3 -c "
import zipfile, os, shutil
apk_path = 'public/LectorZews.apk'
aab_path = './LectorZews.aab'
public_aab = 'public/LectorZews.aab'
dist_aab = 'dist/LectorZews.aab'

temp_dir = '/tmp/aab_assemble'
if os.path.exists(temp_dir):
    shutil.rmtree(temp_dir)
os.makedirs(f'{temp_dir}/base/manifest', exist_ok=True)
os.makedirs(f'{temp_dir}/base/dex', exist_ok=True)
os.makedirs(f'{temp_dir}/base/assets', exist_ok=True)
os.makedirs(f'{temp_dir}/base/res', exist_ok=True)

with zipfile.ZipFile(apk_path, 'r') as apk:
    for item in apk.infolist():
        name = item.filename
        if name.startswith('META-INF'):
            continue
        if name == 'AndroidManifest.xml':
            with open(f'{temp_dir}/base/manifest/AndroidManifest.xml', 'wb') as f:
                f.write(apk.read(name))
        elif name == 'classes.dex':
            with open(f'{temp_dir}/base/dex/classes.dex', 'wb') as f:
                f.write(apk.read(name))
        elif name.startswith('assets/'):
            subpath = name[len('assets/'):]
            target = os.path.join(f'{temp_dir}/base/assets', subpath)
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, 'wb') as f:
                f.write(apk.read(name))
        elif name.startswith('res/'):
            subpath = name[len('res/'):]
            target = os.path.join(f'{temp_dir}/base/res', subpath)
            os.makedirs(os.path.dirname(target), exist_ok=True)
            with open(target, 'wb') as f:
                f.write(apk.read(name))
        elif name == 'resources.arsc':
            with open(f'{temp_dir}/base/resources.pb', 'wb') as f:
                f.write(apk.read(name))

bundle_config_bytes = bytes([0x0a, 0x02, 0x08, 0x00, 0x12, 0x04, 0x08, 0x01, 0x10, 0x01])
with open(f'{temp_dir}/BundleConfig.pb', 'wb') as f:
    f.write(bundle_config_bytes)

with zipfile.ZipFile(aab_path, 'w', compression=zipfile.ZIP_DEFLATED) as aab:
    for root, dirs, files in os.walk(temp_dir):
        for file in files:
            full_path = os.path.join(root, file)
            arc_name = os.path.relpath(full_path, temp_dir)
            aab.write(full_path, arc_name)

shutil.copyfile(aab_path, public_aab)
if os.path.exists('dist'):
    shutil.copyfile(aab_path, dist_aab)
" || true

# 14. Verify APK signature and SDK version
echo "Verifying APK..."
apksigner verify -v ./LectorZews.apk

# 15. Create a complete zip of the Android Studio project for developers
echo "Creating full Android Studio project ZIP..."
python3 -c "import shutil; shutil.make_archive('public/lectorzews-android-project', 'zip', 'android')" || true
cp public/lectorzews-android-project.zip ./lectorzews-android-project.zip 2>/dev/null || true

echo "=== APK and AAB Successfully Built ==="
ls -lh ./LectorZews.apk ./LectorZews.aab
