# MedQuora

An original, responsive study prototype for shared medical foundations. It demonstrates a learning loop: answer a sample question, rate confidence, reflect on mistakes, get targeted guidance, and revisit concepts later.

## Run the web prototype

Open `index.html` in a modern browser. No account or backend is required. Progress and the selected study region are saved in that browser's local storage.

## Build the Android APK

The Flutter Android wrapper and bundled web app are in `mobile/`. With Flutter and the Android SDK installed:

```sh
cd mobile
flutter pub get
flutter build apk --release
cp build/app/outputs/flutter-apk/app-release.apk ../MedQuora.apk
```

The named APK is `MedQuora.apk` in the project root.

The Android home-screen widget can be added from the launcher and customized to show the study plan plus progress, progress only, or the study plan only, with a teal, blue, or purple accent. The widget's “Study now” button opens practice in MedQuora. Android Back navigates within the app; at the home screen, press Back twice within two seconds to exit.

## Scope and safety

The region selector is a preference placeholder; the sample questions are not mapped to any country's exam blueprint, curriculum, or clinical guidelines. Questions are illustrative educational material, not medical advice or decision support. Do not enter patient information.

The prototype has no authentication, cloud sync, clinician-reviewed content workflow, or production-ready privacy controls. Browser progress is stored locally; clear the app's storage to remove it.

MedQuora is an independent educational demo and is not affiliated with any test-preparation provider.
