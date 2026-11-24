# MedQuora

## Version 1.6.0

MedQuora 1.6.0 provides 2,103 distinct pharmacy revision questions: 1,053 in Paper 1 and 1,050 in Paper 2, balanced across the nine Paper 1 and seven Paper 2 topics. Board exam simulations run 60 unseen questions in 60 minutes with a visible countdown, show answer feedback after each question, and open a full paper review at the end. Unanswered questions are marked incorrect when time expires. Every question carries source, license, and region tags. All practice modes use unseen questions until their bank is reset; finished sessions are kept in History and can be reopened in the same answer-by-answer review format.

A responsive study prototype for health-science learners. It demonstrates a learning loop: answer a question, check the result with an explanation, and revisit concepts later.

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

The 2,103-question bank combines 326 original/medication-safety items with 1,538 questions from [MedMCQA](https://huggingface.co/datasets/openlifescienceai/medmcqa) (Apache-2.0), 72 from [Eka NFI MCQA](https://huggingface.co/datasets/ekacare/Eka_NFI_MCQA) (MIT), 167 lab-based chemistry questions from [OpenALG](https://oer.galileo.usg.edu/chemistry-ancillary/18) (CC BY 4.0), plus pharmacist-validated openFDA questions from [RxQA](https://github.com/Google-Health/rxqa) and teaching-point questions from [DurgiPedia](https://durgical.com/en/practice/questions.json), both CC BY 4.0. Earlier sources remain attributed: [Pharmacy Quiz Challenge](https://github.com/rocksonsamuel96/PharmacyQuizChallenge-) (MIT, copyright 2026 rocksonsamuel96), the [OpenExamPrep PPB practice bank](https://open-exam-prep.com/practice/ke-keph-pharmacy), [PharmaProLearn's public Kenya PPB practice page](https://pharmaprolearn.com/exam/boards/kenya-ppb/guides/practice-questions/), and the [PPB Stage Two Paper II model paper](https://www.scribd.com/document/897815579/stagetwopapertwo). Scribd items without a published key are labelled editorial best-evidence. Every question keeps its own source, answer basis, license, source URL, and region tag in the bank; full notices are in `assets/open-pharmacy-license.txt` and in the Android bundle. All items are general revision material—not official PPB questions, verified past papers, Kenya-specific guidance, or a clinically reviewed resource. Questions are not medical advice or decision support. Do not enter patient information.

The prototype has no authentication, cloud sync, clinician-reviewed content workflow, or production-ready privacy controls. Browser progress is stored locally; clear the app's storage to remove it.

MedQuora is an independent educational demo and is not affiliated with any test-preparation provider.
