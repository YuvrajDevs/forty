package expo.modules.fortylock

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.widget.RemoteViews
import org.json.JSONObject
import java.util.Calendar

/**
 * Home-screen widget: your streak and a verse for the day.
 * The app writes the streak and the next two weeks of verses, so the verse still changes each day
 * when the app has not been opened.
 */
class FortyWidgetProvider : AppWidgetProvider() {
  override fun onUpdate(context: Context, manager: AppWidgetManager, ids: IntArray) {
    ids.forEach { update(context, manager, it) }
  }

  companion object {
    private const val PREFS = "fortybible_widget"
    private const val KEY = "data"

    fun save(context: Context, json: String) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json).apply()
      val manager = AppWidgetManager.getInstance(context)
      val ids = manager.getAppWidgetIds(ComponentName(context, FortyWidgetProvider::class.java))
      ids.forEach { update(context, manager, it) }
    }

    private fun update(context: Context, manager: AppWidgetManager, id: Int) {
      val views = RemoteViews(context.packageName, R.layout.forty_widget)
      var streakText = "FortyBible"
      var verse = "Open FortyBible to set up your plan."
      var ref = ""
      try {
        val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null)
        if (raw != null) {
          val o = JSONObject(raw)
          val streak = o.optInt("streak", 0)
          streakText = when {
            streak <= 0 -> "Start your streak today"
            streak == 1 -> "1 day streak"
            else -> "$streak day streak"
          }
          val days = o.optJSONObject("days")
          val today = LockConfig.today(Calendar.getInstance())
          val entry = days?.optJSONObject(today) ?: days?.keys()?.asSequence()?.firstOrNull()?.let { days.optJSONObject(it) }
          if (entry != null) {
            verse = "“" + entry.optString("t") + "”"
            ref = entry.optString("r")
          }
        }
      } catch (e: Exception) {
        // Keep the placeholder text.
      }
      views.setTextViewText(R.id.forty_widget_streak, streakText)
      views.setTextViewText(R.id.forty_widget_verse, verse)
      views.setTextViewText(R.id.forty_widget_ref, ref)

      val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
      if (launch != null) {
        val pending = PendingIntent.getActivity(context, 0, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
        views.setOnClickPendingIntent(R.id.forty_widget_root, pending)
      }
      manager.updateAppWidget(id, views)
    }
  }
}
