package expo.modules.fortylock

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.pm.ApplicationInfo
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.graphics.Canvas
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import android.util.Base64
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.ByteArrayOutputStream

class FortyLockModule : Module() {
  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  // Calls, messages, maps, contacts and emergency apps are never offered for locking.
  private val neverLock = listOf(
    "com.android.dialer", "com.google.android.dialer", "com.samsung.android.dialer", "com.android.phone",
    "com.android.mms", "com.google.android.apps.messaging", "com.samsung.android.messaging",
    "com.android.contacts", "com.google.android.contacts", "com.google.android.apps.maps",
    "com.android.emergency", "com.android.settings", "com.android.systemui",
  )

  override fun definition() = ModuleDefinition {
    Name("FortyLock")

    Function("isAccessibilityEnabled") {
      val flat = Settings.Secure.getString(context.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
      val me = ComponentName(context, FortyLockService::class.java).flattenToString()
      flat.split(':').any { it.equals(me, ignoreCase = true) }
    }

    Function("openAccessibilitySettings") {
      launch(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
    }

    Function("canDrawOverlays") { Settings.canDrawOverlays(context) }

    Function("openOverlaySettings") {
      launch(Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION, Uri.parse("package:" + context.packageName)))
    }

    Function("isBatteryUnrestricted") {
      val pm = context.getSystemService(Context.POWER_SERVICE) as PowerManager
      pm.isIgnoringBatteryOptimizations(context.packageName)
    }

    Function("openBatterySettings") {
      launch(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
    }

    // Stores the settings the service reads. Takes JSON so the shape can change without native edits.
    Function("setConfig") { json: String -> LockConfig.save(context, json) }

    // Streak and the next two weeks of verses for the home-screen widget, as JSON.
    Function("updateWidget") { json: String -> FortyWidgetProvider.save(context, json) }

    Function("setUnlockedUntil") { epochMs: Double -> LockConfig.setUnlockedUntil(context, epochMs.toLong()) }

    Function("launchApp") { packageName: String ->
      context.packageManager.getLaunchIntentForPackage(packageName)?.let { launch(it) }
    }

    Function("goHome") {
      launch(Intent(Intent.ACTION_MAIN).apply { addCategory(Intent.CATEGORY_HOME) })
    }

    AsyncFunction("getInstalledApps") {
      val pm = context.packageManager
      val launcher = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
      pm.queryIntentActivities(launcher, 0)
        .map { it.activityInfo.applicationInfo }
        .filter { it.packageName != context.packageName && !neverLock.contains(it.packageName) }
        .filter { isUserApp(it) }
        .distinctBy { it.packageName }
        .map { info ->
          mapOf(
            "id" to info.packageName,
            "name" to info.loadLabel(pm).toString(),
            "icon" to iconBase64(info, pm),
          )
        }
        .sortedBy { it["name"]!!.lowercase() }
    }
  }

  // User-installed apps, plus system apps that have been updated from the Play Store (YouTube, for example).
  private fun isUserApp(info: ApplicationInfo): Boolean =
    (info.flags and ApplicationInfo.FLAG_SYSTEM) == 0 || (info.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) != 0

  private fun iconBase64(info: ApplicationInfo, pm: PackageManager): String {
    return try {
      val drawable = info.loadIcon(pm)
      val size = 96
      val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
      val canvas = Canvas(bitmap)
      drawable.setBounds(0, 0, size, size)
      drawable.draw(canvas)
      val out = ByteArrayOutputStream()
      bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
      "data:image/png;base64," + Base64.encodeToString(out.toByteArray(), Base64.NO_WRAP)
    } catch (e: Exception) {
      ""
    }
  }

  private fun launch(intent: Intent) {
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    context.startActivity(intent)
  }
}
