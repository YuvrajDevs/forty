package expo.modules.fortylock

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import org.json.JSONArray
import org.json.JSONObject
import java.util.Calendar

/** One verse alarm the person set: a time on chosen days. */
data class VerseAlarm(
  val id: Int,
  /** Minutes after midnight. */
  val minutes: Int,
  /** Monday first. */
  val days: BooleanArray,
  val on: Boolean,
  val speak: Boolean,
  val sound: Boolean,
)

/** Stores the alarms the JS app writes and arms them with the system alarm clock, so they ring when the app is closed. */
object AlarmScheduler {
  private const val PREFS = "fortybible_alarms"
  private const val KEY = "list"
  private const val KEY_ARMED = "armed"
  const val EXTRA_ID = "alarmId"
  const val EXTRA_SPEAK = "speak"
  const val EXTRA_SOUND = "sound"
  const val ACTION_RING = "expo.modules.fortylock.RING"

  fun save(context: Context, json: String) {
    context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json).apply()
    scheduleAll(context)
  }

  fun load(context: Context): List<VerseAlarm> {
    val raw = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(KEY, null) ?: return emptyList()
    return try {
      val arr = JSONArray(raw)
      (0 until arr.length()).map { i ->
        val o = arr.getJSONObject(i)
        val days = BooleanArray(7) { true }
        o.optJSONArray("days")?.let { for (d in 0 until minOf(7, it.length())) days[d] = it.getBoolean(d) }
        VerseAlarm(
          id = o.getInt("id"),
          minutes = o.optInt("minutes", 420).coerceIn(0, 1439),
          days = days,
          on = o.optBoolean("on", true),
          speak = o.optBoolean("speak", true),
          sound = o.optBoolean("sound", true),
        )
      }
    } catch (e: Exception) {
      emptyList()
    }
  }

  /** Next time this alarm should ring after [after], or null if no day is chosen. */
  fun nextTrigger(alarm: VerseAlarm, after: Calendar): Long? {
    if (alarm.days.none { it }) return null
    for (offset in 0..7) {
      val c = after.clone() as Calendar
      c.add(Calendar.DAY_OF_YEAR, offset)
      c.set(Calendar.HOUR_OF_DAY, alarm.minutes / 60)
      c.set(Calendar.MINUTE, alarm.minutes % 60)
      c.set(Calendar.SECOND, 0)
      c.set(Calendar.MILLISECOND, 0)
      val dayIndex = (c.get(Calendar.DAY_OF_WEEK) + 5) % 7
      if (c.timeInMillis > after.timeInMillis && alarm.days[dayIndex]) return c.timeInMillis
    }
    return null
  }

  private fun pending(context: Context, id: Int, speak: Boolean, sound: Boolean): PendingIntent {
    val intent = Intent(context, AlarmReceiver::class.java).setAction(ACTION_RING)
      .putExtra(EXTRA_ID, id).putExtra(EXTRA_SPEAK, speak).putExtra(EXTRA_SOUND, sound)
    return PendingIntent.getBroadcast(context, id, intent, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
  }

  /** Cancels what was armed before and arms every enabled alarm for its next ring. */
  fun scheduleAll(context: Context) {
    val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
    prefs.getStringSet(KEY_ARMED, emptySet())?.forEach { manager.cancel(pending(context, it.toInt(), true, true)) }
    val armed = HashSet<String>()
    val now = Calendar.getInstance()
    val open = context.packageManager.getLaunchIntentForPackage(context.packageName)?.let {
      PendingIntent.getActivity(context, 0, it, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }
    for (a in load(context)) {
      if (!a.on) continue
      val at = nextTrigger(a, now) ?: continue
      try {
        manager.setAlarmClock(AlarmManager.AlarmClockInfo(at, open), pending(context, a.id, a.speak, a.sound))
        armed.add(a.id.toString())
      } catch (e: SecurityException) {
        // Exact alarms were turned off for the app; nothing to arm.
      }
    }
    prefs.edit().putStringSet(KEY_ARMED, armed).apply()
  }

  /** Rings again in [minutes], once. Uses an id that cannot clash with a saved alarm. */
  fun snooze(context: Context, speak: Boolean, sound: Boolean, minutes: Int = 10) {
    val manager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val at = System.currentTimeMillis() + minutes * 60_000L
    try {
      manager.setAlarmClock(AlarmManager.AlarmClockInfo(at, null), pending(context, SNOOZE_ID, speak, sound))
    } catch (e: SecurityException) {
      // ignore
    }
  }

  const val SNOOZE_ID = 999_999

  /** The verse for today from the data the app keeps for the widget, or a plain fallback. */
  fun verseForToday(context: Context): Pair<String, String> {
    return try {
      val raw = context.getSharedPreferences("fortybible_widget", Context.MODE_PRIVATE).getString("data", null)
      val days = JSONObject(raw ?: return FALLBACK).optJSONObject("days") ?: return FALLBACK
      val entry = days.optJSONObject(LockConfig.today(Calendar.getInstance())) ?: days.keys().asSequence().firstOrNull()?.let { days.optJSONObject(it) } ?: return FALLBACK
      entry.optString("t") to entry.optString("r")
    } catch (e: Exception) {
      FALLBACK
    }
  }

  private val FALLBACK = "Your word is a lamp to my feet and a light to my path." to "Psalm 119:105"
}
