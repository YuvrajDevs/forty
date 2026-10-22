package expo.modules.fortylock

import android.app.Activity
import android.app.KeyguardManager
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.media.AudioAttributes
import android.media.Ringtone
import android.media.RingtoneManager
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.view.Gravity
import android.view.View
import android.view.WindowManager
import android.widget.Button
import android.widget.LinearLayout
import android.widget.TextView
import java.util.Locale

/** Full-screen alarm: the day's verse, read aloud, with a gentle sound until you stop or snooze it. */
class AlarmActivity : Activity() {
  private var ringtone: Ringtone? = null
  private var tts: TextToSpeech? = null
  private val handler = Handler(Looper.getMainLooper())
  private var speak = true
  private var sound = true

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    speak = intent.getBooleanExtra(AlarmScheduler.EXTRA_SPEAK, true)
    sound = intent.getBooleanExtra(AlarmScheduler.EXTRA_SOUND, true)

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
      setShowWhenLocked(true)
      setTurnScreenOn(true)
      (getSystemService(Context.KEYGUARD_SERVICE) as KeyguardManager).requestDismissKeyguard(this, null)
    } else {
      @Suppress("DEPRECATION")
      window.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON or WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD)
    }
    window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

    val (verse, ref) = AlarmScheduler.verseForToday(this)
    setContentView(buildView(verse, ref))
    startSound()
    if (speak) startSpeech("$verse. $ref.")
    // A forgotten alarm should not ring all morning.
    handler.postDelayed({ stop() }, 3 * 60_000L)
  }

  private fun buildView(verse: String, ref: String): View {
    val gold = Color.parseColor("#F5C842")
    val root = LinearLayout(this).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER_HORIZONTAL
      setBackgroundColor(Color.parseColor("#15120D"))
      setPadding(dp(28), dp(56), dp(28), dp(36))
    }
    root.addView(TextView(this).apply {
      text = "FORTYBIBLE"
      setTextColor(gold)
      textSize = 13f
      letterSpacing = 0.2f
      gravity = Gravity.CENTER
    })
    val middle = LinearLayout(this).apply { orientation = LinearLayout.VERTICAL; gravity = Gravity.CENTER }
    middle.addView(TextView(this).apply {
      text = "“$verse”"
      setTextColor(Color.parseColor("#F3EEDF"))
      textSize = if (verse.length > 160) 20f else 24f
      typeface = Typeface.SERIF
      gravity = Gravity.CENTER
      setLineSpacing(0f, 1.25f)
    })
    middle.addView(TextView(this).apply {
      text = ref
      setTextColor(gold)
      textSize = 15f
      typeface = Typeface.DEFAULT_BOLD
      gravity = Gravity.CENTER
      setPadding(0, dp(18), 0, 0)
    })
    root.addView(middle, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, 0, 1f))

    fun button(label: String, fill: Boolean, onClick: () -> Unit) = Button(this).apply {
      text = label
      isAllCaps = false
      textSize = 17f
      setTextColor(if (fill) Color.parseColor("#1A1A1A") else Color.parseColor("#F3EEDF"))
      background = GradientDrawable().apply {
        cornerRadius = dp(28).toFloat()
        if (fill) setColor(gold) else setStroke(dp(1), Color.parseColor("#6E6551"))
      }
      setOnClickListener { onClick() }
    }
    val lp = { LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(56)).apply { topMargin = dp(12) } }
    root.addView(button("Read today’s chapter", true) { openApp() }, lp())
    root.addView(button("Snooze 10 minutes", false) {
      AlarmScheduler.snooze(this, speak, sound)
      stop()
    }, lp())
    root.addView(button("Stop", false) { stop() }, lp())
    return root
  }

  private fun dp(v: Int) = (v * resources.displayMetrics.density).toInt()

  private fun startSound() {
    if (!sound) return
    try {
      val uri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM) ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
      ringtone = RingtoneManager.getRingtone(this, uri)?.apply {
        audioAttributes = AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
          isLooping = true
          // Quieter while the verse is read.
          volume = if (speak) 0.35f else 1f
        }
        play()
      }
    } catch (e: Exception) {
      // No sound is better than a crash.
    }
  }

  private fun startSpeech(text: String) {
    tts = TextToSpeech(this) { status ->
      if (status != TextToSpeech.SUCCESS) return@TextToSpeech
      tts?.language = Locale.getDefault()
      tts?.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
      handler.postDelayed({ tts?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "verse") }, 2500)
    }
  }

  private fun openApp() {
    packageManager.getLaunchIntentForPackage(packageName)?.let { startActivity(it.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)) }
    stop()
  }

  private fun stop() {
    handler.removeCallbacksAndMessages(null)
    try { ringtone?.stop() } catch (e: Exception) { /* ignore */ }
    tts?.stop()
    tts?.shutdown()
    tts = null
    (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager).cancel(AlarmReceiver.NOTIFICATION_ID)
    finish()
  }

  override fun onDestroy() {
    handler.removeCallbacksAndMessages(null)
    try { ringtone?.stop() } catch (e: Exception) { /* ignore */ }
    tts?.shutdown()
    super.onDestroy()
  }
}
