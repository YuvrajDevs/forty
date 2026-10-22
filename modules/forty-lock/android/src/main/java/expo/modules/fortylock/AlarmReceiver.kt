package expo.modules.fortylock

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

/** Fires when an alarm is due: re-arms the next one, then shows the alarm screen over the lock screen. */
class AlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent) {
    val id = intent.getIntExtra(AlarmScheduler.EXTRA_ID, 0)
    val speak = intent.getBooleanExtra(AlarmScheduler.EXTRA_SPEAK, true)
    val sound = intent.getBooleanExtra(AlarmScheduler.EXTRA_SOUND, true)
    AlarmScheduler.scheduleAll(context)

    val screen = Intent(context, AlarmActivity::class.java)
      .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
      .putExtra(AlarmScheduler.EXTRA_SPEAK, speak).putExtra(AlarmScheduler.EXTRA_SOUND, sound)
    val full = PendingIntent.getActivity(context, id, screen, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

    val manager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      manager.createNotificationChannel(NotificationChannel(CHANNEL, "Verse alarms", NotificationManager.IMPORTANCE_HIGH).apply { setSound(null, null) })
    }
    val (verse, ref) = AlarmScheduler.verseForToday(context)
    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) Notification.Builder(context, CHANNEL) else @Suppress("DEPRECATION") Notification.Builder(context)
    val note = builder
      .setSmallIcon(context.applicationInfo.icon)
      .setContentTitle("Time for your verse")
      .setContentText("$verse  $ref")
      .setStyle(Notification.BigTextStyle().bigText("“$verse”\n$ref"))
      .setCategory(Notification.CATEGORY_ALARM)
      .setPriority(Notification.PRIORITY_MAX)
      .setAutoCancel(true)
      .setContentIntent(full)
      .setFullScreenIntent(full, true)
      .build()
    manager.notify(NOTIFICATION_ID, note)

    // With the overlay permission the screen can also open straight away.
    try {
      context.startActivity(screen)
    } catch (e: Exception) {
      // The full-screen notification covers it.
    }
  }

  companion object {
    const val CHANNEL = "fortybible_alarm"
    const val NOTIFICATION_ID = 4041
  }
}
