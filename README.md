# MedQuora

## Version 1.3.0

MedQuora 1.3.0 provides 158 distinct pharmacy revision questions from attributed open and public question banks. Sessions exclude previously answered questions until the learner resets the bank.

A responsive study prototype for health-science learners. It demonstrates a learning loop: answer a question, reflect on mistakes, get targeted guidance, and revisit concepts later.

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

## Question source and scope

The pharmacy practice questions include 43 items from [Pharmacy Quiz Challenge](https://github.com/rocksonsamuel96/PharmacyQuizChallenge-), used under its MIT License (copyright 2026 rocksonsamuel96; full notice is in `assets/open-pharmacy-license.txt` and in the Android bundle), 100 items from the [OpenExamPrep PPB practice bank](https://open-exam-prep.com/practice/ke-keph-pharmacy), and 15 items from [PharmaProLearn's public Kenya PPB practice page](https://pharmaprolearn.com/exam/boards/kenya-ppb/guides/practice-questions/). The Scribd document was not added because it exposes questions without an answer key. All items are general pharmacy revision material—not official PPB questions, verified past papers, Kenya-specific guidance, or a clinically reviewed resource. The region selector remains a preference placeholder. Questions are not medical advice or decision support. Do not enter patient information.

The prototype has no authentication, cloud sync, clinician-reviewed content workflow, or production-ready privacy controls. Browser progress is stored locally; clear the app's storage to remove it.

MedQuora is an independent educational demo and is not affiliated with any test-preparation provider.
