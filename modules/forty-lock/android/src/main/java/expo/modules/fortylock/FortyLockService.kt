package expo.modules.fortylock

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.accessibility.AccessibilityEvent
import java.util.Calendar

/**
 * Watches for a chosen app coming to the front and opens FortyBible's reading prompt.
 * It only looks at window changes and never reads screen content.
 */
class FortyLockService : AccessibilityService() {
  private val handler = Handler(Looper.getMainLooper())
  private var lastLaunch = 0L
  private var lastPackage = ""

  override fun onAccessibilityEvent(event: AccessibilityEvent?) {
    if (event?.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
    val pkg = event.packageName?.toString() ?: return
    lastPackage = pkg
    if (pkg == packageName) return
    if (shouldLock(pkg)) launchPrompt(pkg, 0)
  }

  private fun shouldLock(pkg: String): Boolean {
    val cfg = LockConfig.load(this) ?: return false
    return cfg.packages.contains(pkg) && LockRules.shouldLock(cfg, System.currentTimeMillis(), Calendar.getInstance())
  }

  private fun launchPrompt(pkg: String, attempt: Int) {
    // One window change can fire several events.
    val now = SystemClock.elapsedRealtime()
    if (now - lastLaunch < 400) return
    lastLaunch = now

    val intent = Intent(Intent.ACTION_VIEW, Uri.parse("fortybible://lock?pkg=" + Uri.encode(pkg))).apply {
      setPackage(packageName)
      addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    }
    startActivity(intent)

    // Some apps open a second screen a moment later and cover the prompt. If the locked app
    // ended up in front again, bring the prompt back.
    if (attempt < 2) {
      handler.postDelayed({
        if (lastPackage == pkg && shouldLock(pkg)) launchPrompt(pkg, attempt + 1)
      }, 900)
    }
  }

  override fun onInterrupt() {}
}
