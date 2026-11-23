import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:webview_flutter/webview_flutter.dart';

import 'back_exit_policy.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const MedQuoraApp());
}

class MedQuoraApp extends StatelessWidget {
  const MedQuoraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MedQuora',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF287C76),
          surface: const Color(0xFFF5F7F8),
        ),
        scaffoldBackgroundColor: const Color(0xFFF5F7F8),
        useMaterial3: true,
      ),
      home: const StudyAppPage(),
    );
  }
}

class StudyAppPage extends StatefulWidget {
  const StudyAppPage({super.key});

  @override
  State<StudyAppPage> createState() => _StudyAppPageState();
}

class _StudyAppPageState extends State<StudyAppPage> {
  static const _widgetChannel = MethodChannel('com.medquora/widget');
  late final WebViewController _controller;
  bool _isLoading = true;
  bool _pageLoaded = false;
  bool _pendingWidgetOpen = false;
  DateTime? _lastBackPress;
  String? _loadError;

  @override
  void initState() {
    super.initState();
    _controller = WebViewController();
    _widgetChannel.setMethodCallHandler(_handleNativeCall);
    unawaited(_initializeWebView());
  }

  Future<void> _initializeWebView() async {
    await _controller.setJavaScriptMode(JavaScriptMode.unrestricted);
    await _controller.setBackgroundColor(const Color(0xFFF5F7F8));
    await _controller.addJavaScriptChannel(
      'MedQuoraWidget',
      onMessageReceived: _handleWidgetMessage,
    );
    await _controller.setNavigationDelegate(
      NavigationDelegate(
        onPageFinished: (_) {
          if (!mounted) return;
          setState(() {
            _isLoading = false;
            _loadError = null;
            _pageLoaded = true;
          });
          unawaited(_openPendingWidgetAction());
        },
        onWebResourceError: (error) {
          if (error.isForMainFrame == false || !mounted) return;
          setState(() {
            _isLoading = false;
            _loadError = error.description;
          });
        },
      ),
    );
    await _controller.loadFlutterAsset('assets/web/index.html');
  }

  void _handleWidgetMessage(JavaScriptMessage message) {
    try {
      final data = jsonDecode(message.message);
      if (data is! Map<String, dynamic>) return;
      unawaited(_widgetChannel.invokeMethod<void>('syncWidget', data));
    } on FormatException catch (error) {
      debugPrint('Invalid MedQuora widget update: $error');
    }
  }

  Future<void> _handleNativeCall(MethodCall call) async {
    if (call.method != 'openQuickPractice') return;
    await _widgetChannel.invokeMethod<bool>('consumePendingQuickPractice');
    if (!_pageLoaded) {
      _pendingWidgetOpen = true;
      return;
    }
    await _openPracticeFromWidget();
  }

  Future<void> _openPendingWidgetAction() async {
    final nativeShouldOpen = await _widgetChannel.invokeMethod<bool>(
      'consumePendingQuickPractice',
    );
    final shouldOpen = _pendingWidgetOpen || (nativeShouldOpen ?? false);
    _pendingWidgetOpen = false;
    if (shouldOpen) await _openPracticeFromWidget();
  }

  Future<void> _openPracticeFromWidget() {
    return _controller.runJavaScript(
      "document.querySelector('[data-open-practice]')?.click();",
    );
  }

  Future<void> _handleBack(bool didPop) async {
    if (didPop) return;
    if (await _controller.canGoBack()) {
      _lastBackPress = null;
      await _controller.goBack();
      return;
    }

    final now = DateTime.now();
    final lastPress = _lastBackPress;
    if (shouldExitOnBack(lastPress, now)) {
      await SystemNavigator.pop();
      return;
    }
    _lastBackPress = now;
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        const SnackBar(
          content: Text('Press back again to exit MedQuora'),
          duration: Duration(seconds: 2),
        ),
      );
  }

  Future<void> _retry() async {
    setState(() {
      _isLoading = true;
      _loadError = null;
    });
    await _controller.reload();
  }

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: false,
      onPopInvokedWithResult: (didPop, _) => _handleBack(didPop),
      child: Scaffold(
        body: SafeArea(
          child: Stack(
            children: [
              WebViewWidget(controller: _controller),
              if (_isLoading && _loadError == null)
                const Center(
                  child: CircularProgressIndicator(
                    color: Color(0xFF287C76),
                  ),
                ),
              if (_loadError case final error?)
                ColoredBox(
                  color: const Color(0xFFF5F7F8),
                  child: Center(
                    child: Padding(
                      padding: const EdgeInsets.all(28),
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(
                            Icons.wifi_off_rounded,
                            color: Color(0xFF287C76),
                            size: 40,
                          ),
                          const SizedBox(height: 16),
                          const Text(
                            'MedQuora could not open',
                            style: TextStyle(
                              color: Color(0xFF1B2832),
                              fontSize: 18,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            error,
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                              color: Color(0xFF78838B),
                              fontSize: 13,
                            ),
                          ),
                          const SizedBox(height: 20),
                          FilledButton(
                            onPressed: _retry,
                            child: const Text('Try again'),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
