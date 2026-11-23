package com.medquora.medquora

import android.app.Activity
import android.appwidget.AppWidgetManager
import android.content.Intent
import android.content.res.ColorStateList
import android.graphics.Color
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.LinearLayout
import android.widget.RadioButton
import android.widget.RadioGroup
import android.widget.ScrollView
import android.widget.Spinner
import android.widget.TextView

class WidgetConfigActivity : Activity() {
    private val modes = listOf(
        "Study plan + progress" to "both",
        "Progress only" to "progress",
        "Study plan only" to "plan",
    )
    private val accents = listOf(
        "Teal" to "teal",
        "Blue" to "blue",
        "Purple" to "purple",
    )

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setResult(RESULT_CANCELED)
        val widgetId = intent?.getIntExtra(
            AppWidgetManager.EXTRA_APPWIDGET_ID,
            AppWidgetManager.INVALID_APPWIDGET_ID,
        ) ?: AppWidgetManager.INVALID_APPWIDGET_ID
        if (widgetId == AppWidgetManager.INVALID_APPWIDGET_ID) {
            finish()
            return
        }

        val preferences = getSharedPreferences(
            MedQuoraWidgetProvider.PREFERENCES,
            MODE_PRIVATE,
        )
        val content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(24), dp(28), dp(24), dp(24))
            setBackgroundColor(Color.rgb(245, 247, 248))
        }
        val scrollView = ScrollView(this).apply {
            addView(
                content,
                ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.WRAP_CONTENT,
                ),
            )
        }
        setContentView(scrollView)

        content.addView(
            TextView(this).apply {
                text = "Customize your widget"
                textSize = 23f
                setTextColor(Color.rgb(27, 40, 50))
                setTypeface(typeface, android.graphics.Typeface.BOLD)
            },
        )
        content.addView(
            TextView(this).apply {
                text = "Choose what MedQuora shows on your home screen."
                textSize = 14f
                setTextColor(Color.rgb(100, 114, 122))
                setPadding(0, dp(8), 0, dp(20))
            },
        )
        content.addView(sectionTitle("Content"))

        val modeSpinner = Spinner(this).apply {
            adapter = ArrayAdapter(
                this@WidgetConfigActivity,
                android.R.layout.simple_spinner_dropdown_item,
                modes.map { it.first },
            )
            val savedMode = preferences.getString(
                MedQuoraWidgetProvider.modeKey(widgetId),
                "both",
            )
            setSelection(modes.indexOfFirst { it.second == savedMode }.coerceAtLeast(0))
        }
        content.addView(modeSpinner)
        content.addView(sectionTitle("Accent color", top = 20))

        val accentGroup = RadioGroup(this).apply {
            orientation = RadioGroup.VERTICAL
        }
        accents.forEach { (label, key) ->
            val radio = RadioButton(this).apply {
                id = View.generateViewId()
                text = label
                tag = key
                textSize = 14f
                buttonTintList = ColorStateList.valueOf(Color.rgb(40, 124, 118))
            }
            accentGroup.addView(radio)
            if (preferences.getString(MedQuoraWidgetProvider.accentKey(widgetId), "teal") == key) {
                accentGroup.check(radio.id)
            }
        }
        content.addView(accentGroup)
        content.addView(
            Button(this).apply {
                text = "Save widget"
                setOnClickListener {
                    val accent = accentGroup.findViewById<RadioButton>(accentGroup.checkedRadioButtonId)
                        ?.tag as? String ?: "teal"
                    preferences.edit()
                        .putString(
                            MedQuoraWidgetProvider.modeKey(widgetId),
                            modes[modeSpinner.selectedItemPosition].second,
                        )
                        .putString(MedQuoraWidgetProvider.accentKey(widgetId), accent)
                        .apply()

                    MedQuoraWidgetProvider.updateAppWidget(
                        this@WidgetConfigActivity,
                        AppWidgetManager.getInstance(this@WidgetConfigActivity),
                        widgetId,
                    )
                    setResult(
                        RESULT_OK,
                        Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, widgetId),
                    )
                    finish()
                }
            },
        )
        content.addView(
            Button(this).apply {
                text = "Cancel"
                setOnClickListener { finish() }
            },
        )
    }

    private fun sectionTitle(title: String, top: Int = 0): TextView {
        return TextView(this).apply {
            text = title
            textSize = 15f
            setTextColor(Color.rgb(27, 40, 50))
            setPadding(0, dp(top), 0, dp(8))
            gravity = Gravity.CENTER_VERTICAL
        }
    }

    private fun dp(value: Int): Int = (value * resources.displayMetrics.density).toInt()
}
