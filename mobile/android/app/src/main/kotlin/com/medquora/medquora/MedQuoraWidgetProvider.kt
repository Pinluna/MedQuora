package com.medquora.medquora

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews

class MedQuoraWidgetProvider : AppWidgetProvider() {
    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray,
    ) {
        appWidgetIds.forEach { widgetId ->
            updateAppWidget(context, appWidgetManager, widgetId)
        }
    }

    override fun onDeleted(context: Context, appWidgetIds: IntArray) {
        val preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
        val editor = preferences.edit()
        appWidgetIds.forEach { widgetId ->
            editor.remove(modeKey(widgetId))
            editor.remove(accentKey(widgetId))
        }
        editor.apply()
    }

    companion object {
        const val PREFERENCES = "medquora_widget"

        fun modeKey(widgetId: Int) = "mode_$widgetId"
        fun accentKey(widgetId: Int) = "accent_$widgetId"

        fun updateAll(context: Context) {
            val manager = AppWidgetManager.getInstance(context)
            val component = ComponentName(context, MedQuoraWidgetProvider::class.java)
            val widgetIds = manager.getAppWidgetIds(component)
            widgetIds.forEach { widgetId ->
                updateAppWidget(context, manager, widgetId)
            }
        }

        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            widgetId: Int,
        ) {
            val preferences = context.getSharedPreferences(PREFERENCES, Context.MODE_PRIVATE)
            val views = RemoteViews(context.packageName, R.layout.medquora_widget)
            val mode = preferences.getString(modeKey(widgetId), "both") ?: "both"
            val due = preferences.getInt("due", 0)
            val streak = preferences.getInt("streak", 0)
            val weeklyProgress = preferences.getInt("weeklyProgress", 0)

            views.setTextViewText(
                R.id.widget_focus,
                if (due > 0) "$due concept reviews ready"
                else "Ready for a focused study session",
            )
            views.setTextViewText(R.id.widget_week, "$weeklyProgress this week")
            views.setTextViewText(R.id.widget_streak, "$streak day streak")
            views.setTextViewText(R.id.widget_due, "$due due")
            views.setViewVisibility(
                R.id.widget_stats,
                if (mode == "plan") android.view.View.GONE else android.view.View.VISIBLE,
            )
            views.setViewVisibility(
                R.id.widget_focus,
                if (mode == "progress") android.view.View.GONE else android.view.View.VISIBLE,
            )

            val buttonBackground = when (preferences.getString(accentKey(widgetId), "teal")) {
                "blue" -> R.drawable.medquora_widget_button_blue
                "purple" -> R.drawable.medquora_widget_button_purple
                else -> R.drawable.medquora_widget_button
            }
            views.setInt(R.id.widget_open, "setBackgroundResource", buttonBackground)

            val openIntent = Intent(context, MainActivity::class.java).apply {
                action = MainActivity.ACTION_OPEN_QUICK_PRACTICE
                flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            val openPendingIntent = PendingIntent.getActivity(
                context,
                widgetId,
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
            )
            views.setOnClickPendingIntent(R.id.widget_open, openPendingIntent)
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}
