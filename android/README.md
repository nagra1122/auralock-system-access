# Android Setup Instructions

## Prerequisites
- Android Studio installed
- Node.js and npm installed
- Git installed

## Setup Steps

### 1. Export and Clone Project
1. Click "Export to Github" button in Lovable
2. Clone your repository:
```bash
git clone <your-repo-url>
cd auralock-system-access
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Initialize Capacitor (if not done)
```bash
npx cap init
```

### 4. Add Android Platform
```bash
npx cap add android
```

### 5. Update Android Dependencies
```bash
npx cap update android
```

### 6. Build the Web App
```bash
npm run build
```

### 7. Sync with Android
```bash
npx cap sync
```

### 8. Open in Android Studio
```bash
npx cap open android
```

## Running on Device/Emulator

### Option 1: Using Capacitor CLI
```bash
npx cap run android
```

### Option 2: Using Android Studio
1. Open the project in Android Studio (step 8 above)
2. Select your device/emulator
3. Click the Run button

## Making it a Lock Screen App

To make Auralock work as an actual device lock screen replacement:

1. Open `android/app/src/main/AndroidManifest.xml`
2. Add these permissions:
```xml
<uses-permission android:name="android.permission.DISABLE_KEYGUARD" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
```

3. Add lock screen intent filter to MainActivity:
```xml
<intent-filter>
    <action android:name="android.intent.action.MAIN" />
    <category android:name="android.intent.category.HOME" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.LAUNCHER" />
</intent-filter>
```

4. After installing, go to Android Settings → Apps → Default Apps → Home App → Select Auralock

## Hot Reload Development

The app is configured to hot-reload from the Lovable sandbox during development. To build for production:

1. Remove the `server` section from `capacitor.config.ts`
2. Run `npm run build`
3. Run `npx cap sync`
4. Rebuild in Android Studio

## Troubleshooting

- **Build errors**: Run `npx cap sync` after any code changes
- **Permissions issues**: Check AndroidManifest.xml has all required permissions
- **App not loading**: Ensure your device can access the Lovable preview URL (check WiFi)

## Features Ready for Android

✅ Haptic Feedback (vibration on unlock attempts)
✅ Status Bar customization (dark theme)
✅ Numeric PIN keypad with touch feedback
✅ Voice recognition (requires microphone permission)
✅ Password unlock
✅ Settings persistence via localStorage

## Next Steps

After setup, test all features:
1. PIN unlock with numeric keypad
2. Password unlock
3. Voice command unlock
4. Haptic feedback on button presses
5. Lock screen mode switching
