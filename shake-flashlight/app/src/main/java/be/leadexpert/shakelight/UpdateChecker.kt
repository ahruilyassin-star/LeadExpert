package be.leadexpert.shakelight

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Handler
import android.os.Looper
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.text.SimpleDateFormat
import java.util.Locale

object UpdateChecker {

    private const val RELEASES_API =
        "https://api.github.com/repos/ahruilyassin-star/LeadExpert/releases/tags/shakelight-latest"
    const val APK_URL =
        "https://github.com/ahruilyassin-star/LeadExpert/releases/download/shakelight-latest/ShakeLight.apk"

    fun checkAsync(context: Context, onUpdateAvailable: () -> Unit) {
        Thread {
            try {
                val conn = URL(RELEASES_API).openConnection() as HttpURLConnection
                conn.connectTimeout = 6_000
                conn.readTimeout   = 6_000
                conn.setRequestProperty("Accept", "application/vnd.github.v3+json")
                if (conn.responseCode == 200) {
                    val body = conn.inputStream.bufferedReader().readText()
                    val publishedAt = JSONObject(body).getString("published_at")
                    val fmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US)
                    val releaseMs = fmt.parse(publishedAt)?.time ?: return@Thread
                    if (releaseMs > BuildConfig.BUILD_TIME) {
                        Handler(Looper.getMainLooper()).post { onUpdateAvailable() }
                    }
                }
                conn.disconnect()
            } catch (_: Exception) { /* negeer networkfouten */ }
        }.start()
    }

    fun openDownload(context: Context) {
        context.startActivity(
            Intent(Intent.ACTION_VIEW, Uri.parse(APK_URL))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
    }
}
