package expo.modules.fortylock

import android.content.Context
import org.json.JSONObject
import java.util.Calendar

/** Settings the JS app writes, so the lock keeps working when the app is closed. */
data class LockConfig(
  val enabled: Boolean,
  val entitled: Boolean,
  val packages: Set<String>,
  /** Monday first. */
  val lockDays: BooleanArray,
  val startHour: Int,
  val endHour: Int,
  /** Day the numbers below were calculated for, as yyyy-MM-dd. */
  val date: String,
  /** Readings still to do on [date]. */
  val pending: Int,
  val skipDate: String,
  val unlockedUntil: Long,
) {
  companion object {
    private const val PREFS = "fortybible_lock"
    private const val KEY = "config"
    private const val KEY_UNLOCK = "unlockedUntil"

    fun save(context: Context, json: String) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(KEY, json).apply()
    }

    fun setUnlockedUntil(context: Context, until: Long) {
      context.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putLong(KEY_UNLOCK, until).apply()
    }

    fun load(context: Context): LockConfig? {
      val prefs = context.getSharedPreferences(PREFS, Context.MODE_PRIVATE)
      val raw = prefs.getString(KEY, null) ?: return null
      return try {
        val o = JSONObject(raw)
        val pkgs = HashSet<String>()
        o.optJSONArray("packages")?.let { for (i in 0 until it.length()) pkgs.add(it.getString(i)) }
        val days = BooleanArray(7) { true }
        o.optJSONArray("lockDays")?.let { for (i in 0 until minOf(7, it.length())) days[i] = it.getBoolean(i) }
        LockConfig(
          enabled = o.optBoolean("enabled", false),
          entitled = o.optBoolean("entitled", false),
          packages = pkgs,
          lockDays = days,
          startHour = o.optInt("startHour", 7),
          endHour = o.optInt("endHour", 22),
          date = o.optString("date", ""),
          pending = o.optInt("pending", 1),
          skipDate = o.optString("skipDate", ""),
          unlockedUntil = prefs.getLong(KEY_UNLOCK, 0L),
        )
      } catch (e: Exception) {
        null
      }
    }

    fun today(cal: Calendar = Calendar.getInstance()): String =
      String.format("%04d-%02d-%02d", cal.get(Calendar.YEAR), cal.get(Calendar.MONTH) + 1, cal.get(Calendar.DAY_OF_MONTH))
  }
}

object LockRules {
  /** Whether opening a chosen app right now should show the reading prompt. */
  fun shouldLock(cfg: LockConfig, nowMs: Long, cal: Calendar): Boolean {
    if (!cfg.enabled || !cfg.entitled) return false
    if (nowMs < cfg.unlockedUntil) return false
    val today = LockConfig.today(cal)
    if (cfg.skipDate == today) return false
    // Monday = 0 ... Sunday = 6. Calendar.SUNDAY is 1.
    val dayIndex = (cal.get(Calendar.DAY_OF_WEEK) + 5) % 7
    if (!cfg.lockDays[dayIndex]) return false
    val hour = cal.get(Calendar.HOUR_OF_DAY)
    if (hour < cfg.startHour || hour >= cfg.endHour) return false
    // If the numbers are from another day, let the app open and recalculate.
    if (cfg.date == today && cfg.pending <= 0) return false
    return true
  }
}
