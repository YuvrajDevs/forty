package expo.modules.fortylock

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.net.Uri
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import java.util.Calendar

/**
 * Watches for a chosen app coming to the front and opens FortyBible's reading prompt.
 * It only looks at window changes and never reads screen content.
 */
class FortyLockService : AccessibilityService() {
  private var lastLaunch = 0L

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val pkg = event.packageName?.toString() ?: return
    if (pkg == packageName) return

    val cfg = LockConfig.load(this) ?: return
    if (!cfg.packages.contains(pkg)) return
    if (!LockRules.shouldLock(cfg, System.currentTimeMillis(), Calendar.getInstance())) return

    // One window change can fire several events.
    val now = SystemClock.elapsedRealtime()
    if (now - lastLaunch < 1500) return
    lastLaunch = now

    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("fortybible://lock?pkg=" + Uri.encode(pkg))).apply {
      setPackage(packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    startActivity(intent)
  }

  override fun onInterrupt() {}
}
