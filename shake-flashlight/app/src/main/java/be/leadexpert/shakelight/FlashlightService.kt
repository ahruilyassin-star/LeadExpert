package be.leadexpert.shakelight

import android.app.*
import android.content.Context
import android.content.Intent
import android.hardware.SensorManager
import android.hardware.camera2.CameraCharacteristics
import android.hardware.camera2.CameraManager
import android.media.MediaPlayer
import android.os.*
import androidx.core.app.NotificationCompat
import kotlin.math.max
import kotlin.math.roundToInt

class FlashlightService : Service() {

    companion object {
        const val ACTION_START            = "be.leadexpert.shakelight.START"
        const val ACTION_STOP             = "be.leadexpert.shakelight.STOP"
        const val ACTION_TOGGLE           = "be.leadexpert.shakelight.TOGGLE"
        const val ACTION_APPLY_BRIGHTNESS = "be.leadexpert.shakelight.APPLY_BRIGHTNESS"

        const val EXTRA_SENSITIVITY = "sensitivity"

        const val BROADCAST_STATE          = "be.leadexpert.shakelight.STATE"
        const val EXTRA_FLASHLIGHT_ON      = "flashlight_on"
        const val EXTRA_MAGNITUDE          = "magnitude"
        const val EXTRA_SHAKE_SCORE        = "shake_score"
        const val EXTRA_SUPPORTS_DIMMING   = "supports_dimming"

        private const val CHANNEL_ID      = "shakelight_svc"
        private const val NOTIFICATION_ID = 1

        @Volatile var isRunning    = false
        @Volatile var supportsDimming = false
    }

    private lateinit var prefs: PrefsManager
    private lateinit var shakeDetector: ShakeDetector
    private lateinit var cameraManager: CameraManager
    private var cameraId: String? = null
    private var maxTorchStrength = 1

    private var flashlightOn = false
    private var wakeLock: PowerManager.WakeLock? = null

    private val mainHandler = Handler(Looper.getMainLooper())
    private val autoOffRunnable = Runnable { setTorch(false) }

    private val torchCallback = object : CameraManager.TorchCallback() {
        override fun onTorchModeChanged(cId: String, enabled: Boolean) {
            if (cId == cameraId && !enabled && flashlightOn) {
                mainHandler.removeCallbacks(autoOffRunnable)
                flashlightOn = false
                broadcastState(0f, 0f)
                updateNotification()
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        isRunning = true
        prefs = PrefsManager(this)

        cameraManager = getSystemService(Context.CAMERA_SERVICE) as CameraManager
        cameraId = findTorchCameraId()
        maxTorchStrength = getMaxTorchStrength()
        supportsDimming = maxTorchStrength > 1
        cameraManager.registerTorchCallback(torchCallback, mainHandler)

        createNotificationChannel()

        shakeDetector = ShakeDetector(
            sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager,
            onShake = { toggleFlashlight() },
            onIntensityUpdate = { mag, score -> broadcastState(mag, score) }
        )
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, buildNotification())

        when (intent?.action) {
            ACTION_STOP -> {
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_TOGGLE -> {
                toggleFlashlight()
                return START_STICKY
            }
            ACTION_APPLY_BRIGHTNESS -> {
                if (flashlightOn) setTorch(true)
                return START_STICKY
            }
        }

        shakeDetector.sensitivity =
            intent?.getIntExtra(EXTRA_SENSITIVITY, prefs.sensitivity) ?: prefs.sensitivity

        if (prefs.keepAwake) acquireWakeLock() else releaseWakeLock()

        shakeDetector.start()
        return START_STICKY
    }

    override fun onDestroy() {
        isRunning = false
        mainHandler.removeCallbacks(autoOffRunnable)
        shakeDetector.stop()
        setTorch(false)
        cameraManager.unregisterTorchCallback(torchCallback)
        releaseWakeLock()
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ── Flashlight ────────────────────────────────────────────────────────────

    private fun toggleFlashlight() = setTorch(!flashlightOn)

    private fun setTorch(on: Boolean) {
        val id = cameraId ?: return
        try {
            if (on && Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && maxTorchStrength > 1) {
                val pct = prefs.brightness.coerceIn(1, 100)
                val strength = max(1, (pct * maxTorchStrength / 100f).roundToInt())
                cameraManager.turnOnTorchWithStrengthLevel(id, strength)
            } else {
                cameraManager.setTorchMode(id, on)
            }
            flashlightOn = on
        } catch (_: Exception) {
            try { cameraManager.setTorchMode(id, on); flashlightOn = on }
            catch (_: Exception) { flashlightOn = false }
        }

        if (on && flashlightOn) {
            if (prefs.soundFeedback)     playSound()
            if (prefs.vibrationFeedback) vibrate()
            scheduleAutoOff()
        } else {
            mainHandler.removeCallbacks(autoOffRunnable)
        }

        broadcastState(0f, 0f)
        updateNotification()
    }

    // ── Feedback ──────────────────────────────────────────────────────────────

    private val soundResources = intArrayOf(
        R.raw.snd_01, R.raw.snd_02, R.raw.snd_03, R.raw.snd_04, R.raw.snd_05,
        R.raw.snd_06, R.raw.snd_07, R.raw.snd_08, R.raw.snd_09, R.raw.snd_10,
        R.raw.snd_11, R.raw.snd_12, R.raw.snd_13, R.raw.snd_14, R.raw.snd_15,
        R.raw.snd_16, R.raw.snd_17, R.raw.snd_18, R.raw.snd_19, R.raw.snd_20
    )

    private fun playSound() {
        val resId = soundResources.getOrElse(prefs.soundType) { soundResources[0] }
        try {
            MediaPlayer.create(this, resId)?.apply {
                setOnCompletionListener { release() }
                start()
            }
        } catch (_: Exception) {}
    }

    @Suppress("DEPRECATION")
    private fun vibrate() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vm = getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                vm.defaultVibrator.vibrate(
                    VibrationEffect.createOneShot(60, VibrationEffect.DEFAULT_AMPLITUDE)
                )
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val v = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                v.vibrate(VibrationEffect.createOneShot(60, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                val v = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                v.vibrate(60)
            }
        } catch (_: Exception) {}
    }

    // ── Auto-off timer ────────────────────────────────────────────────────────

    private fun scheduleAutoOff() {
        mainHandler.removeCallbacks(autoOffRunnable)
        val minutes = prefs.autoOffMinutes
        if (minutes > 0) {
            mainHandler.postDelayed(autoOffRunnable, minutes * 60_000L)
        }
    }

    // ── Camera helpers ────────────────────────────────────────────────────────

    private fun findTorchCameraId(): String? = try {
        cameraManager.cameraIdList.firstOrNull { id ->
            cameraManager.getCameraCharacteristics(id)
                .get(CameraCharacteristics.FLASH_INFO_AVAILABLE) == true
        }
    } catch (_: Exception) { null }

    private fun getMaxTorchStrength(): Int {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) return 1
        val id = cameraId ?: return 1
        return try {
            cameraManager.getCameraCharacteristics(id)
                .get(CameraCharacteristics.FLASH_INFO_STRENGTH_MAXIMUM_LEVEL) ?: 1
        } catch (_: Exception) { 1 }
    }

    // ── Broadcasts ────────────────────────────────────────────────────────────

    private fun broadcastState(magnitude: Float, shakeScore: Float) {
        sendBroadcast(Intent(BROADCAST_STATE).apply {
            putExtra(EXTRA_FLASHLIGHT_ON, flashlightOn)
            putExtra(EXTRA_MAGNITUDE, magnitude)
            putExtra(EXTRA_SHAKE_SCORE, shakeScore)
            putExtra(EXTRA_SUPPORTS_DIMMING, maxTorchStrength > 1)
            `package` = packageName
        })
    }

    // ── Notification ──────────────────────────────────────────────────────────

    private fun buildNotification(): Notification {
        val openPi = PendingIntent.getActivity(
            this, 0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val togglePi = PendingIntent.getService(
            this, 1,
            Intent(this, FlashlightService::class.java).apply { action = ACTION_TOGGLE },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val stopPi = PendingIntent.getService(
            this, 2,
            Intent(this, FlashlightService::class.java).apply { action = ACTION_STOP },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val statusText = if (flashlightOn)
            getString(R.string.notif_light_on) else getString(R.string.notif_listening)
        val toggleLabel = if (flashlightOn)
            getString(R.string.notif_turn_off) else getString(R.string.notif_turn_on)

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(getString(R.string.app_name))
            .setContentText(statusText)
            .setSmallIcon(R.drawable.ic_flashlight)
            .setContentIntent(openPi)
            .addAction(R.drawable.ic_flashlight, toggleLabel, togglePi)
            .addAction(R.drawable.ic_stop, getString(R.string.notif_stop), stopPi)
            .setOngoing(true)
            .setSilent(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun updateNotification() {
        (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
            .notify(NOTIFICATION_ID, buildNotification())
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val ch = NotificationChannel(
                CHANNEL_ID,
                getString(R.string.channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.channel_desc)
                setShowBadge(false)
            }
            (getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager)
                .createNotificationChannel(ch)
        }
    }

    // ── WakeLock ──────────────────────────────────────────────────────────────

    @Suppress("DEPRECATION")
    private fun acquireWakeLock() {
        if (wakeLock?.isHeld == true) return
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "ShakeLight::SensorWakeLock"
        ).also { it.acquire() }
    }

    private fun releaseWakeLock() {
        wakeLock?.let { if (it.isHeld) it.release() }
        wakeLock = null
    }
}
