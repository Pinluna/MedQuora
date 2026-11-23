package com.medquora.medquora

import android.content.Intent
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private var widgetChannel: MethodChannel? = null
    private var pendingQuickPractice = false

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        if (intent?.action == ACTION_OPEN_QUICK_PRACTICE) {
            pendingQuickPractice = true
        }

        widgetChannel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            CHANNEL_NAME,
        ).also { channel ->
            channel.setMethodCallHandler { call, result ->
                when (call.method) {
                    "syncWidget" -> {
                        val stats = call.arguments as? Map<*, *>
                        if (stats == null) {
                            result.error("INVALID_STATS", "Widget stats are missing.", null)
                            return@setMethodCallHandler
                        }
                        getSharedPreferences(
                            MedQuoraWidgetProvider.PREFERENCES,
                            MODE_PRIVATE,
                        ).edit()
                            .putInt("due", stats.number("due"))
                            .putInt("streak", stats.number("streak"))
                            .putInt("accuracy", stats.number("accuracy"))
                            .putInt("weeklyProgress", stats.number("weeklyProgress"))
                            .putInt("total", stats.number("total"))
                            .apply()
                        MedQuoraWidgetProvider.updateAll(this)
                        result.success(null)
                    }

                    "consumePendingQuickPractice" -> {
                        val shouldOpen = pendingQuickPractice ||
                            intent?.action == ACTION_OPEN_QUICK_PRACTICE
                        pendingQuickPractice = false
                        intent?.action = null
                        result.success(shouldOpen)
                    }

                    else -> result.notImplemented()
                }
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
        if (intent.action == ACTION_OPEN_QUICK_PRACTICE) {
            pendingQuickPractice = true
            widgetChannel?.invokeMethod("openQuickPractice", null)
        }
    }

    private fun Map<*, *>.number(key: String): Int {
        return (this[key] as? Number)?.toInt()?.coerceAtLeast(0) ?: 0
    }

    companion object {
        const val CHANNEL_NAME = "com.medquora/widget"
        const val ACTION_OPEN_QUICK_PRACTICE = "com.medquora.OPEN_QUICK_PRACTICE"
    }
}
