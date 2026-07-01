package be.leadexpert.shakelight

import android.Manifest
import android.content.*
import android.content.pm.PackageManager
import android.net.Uri
import android.os.*
import android.provider.Settings
import android.media.MediaPlayer
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.widget.SwitchCompat
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat

class MainActivity : AppCompatActivity() {

    private lateinit var prefs: PrefsManager

    private lateinit var switchService: SwitchCompat
    private lateinit var flashIcon: TextView
    private lateinit var tvStatus: TextView
    private lateinit var shakeMeter: ShakeMeterView
    private lateinit var sliderSensitivity: SeekBar
    private lateinit var tvSensLabel: TextView
    private lateinit var switchAutoStart: SwitchCompat
    private lateinit var switchKeepAwake: SwitchCompat
    private lateinit var tvSensDesc: TextView
    private lateinit var sliderBrightness: SeekBar
    private lateinit var tvBrightnessLabel: TextView
    private lateinit var tvBrightnessDesc: TextView
    private lateinit var switchSoundFeedback: SwitchCompat
    private lateinit var switchVibration: SwitchCompat
    private lateinit var tvAutoOff: TextView
    private lateinit var tvSoundType: TextView

    private val soundResources = intArrayOf(
        R.raw.snd_01, R.raw.snd_02, R.raw.snd_03, R.raw.snd_04, R.raw.snd_05,
        R.raw.snd_06, R.raw.snd_07, R.raw.snd_08, R.raw.snd_09, R.raw.snd_10,
        R.raw.snd_11, R.raw.snd_12, R.raw.snd_13, R.raw.snd_14, R.raw.snd_15,
        R.raw.snd_16, R.raw.snd_17, R.raw.snd_18, R.raw.snd_19, R.raw.snd_20
    )

    private val autoOffOptions = listOf(0, 1, 5, 10, 30)

    private var flashlightOn = false

    private val stateReceiver = object : BroadcastReceiver() {
        override fun onReceive(ctx: Context, intent: Intent) {
            flashlightOn = intent.getBooleanExtra(FlashlightService.EXTRA_FLASHLIGHT_ON, false)
            val mag = intent.getFloatExtra(FlashlightService.EXTRA_MAGNITUDE, 0f)
            val score = intent.getFloatExtra(FlashlightService.EXTRA_SHAKE_SCORE, 0f)
            val dimming = intent.getBooleanExtra(FlashlightService.EXTRA_SUPPORTS_DIMMING, false)
            updateFlashIcon()
            shakeMeter.update(mag, score)
            updateBrightnessDesc(dimming)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        prefs = PrefsManager(this)
        bindViews()
        setupListeners()

        requestNeededPermissions()
        UpdateChecker.checkAsync(this) { showUpdateDialog() }
    }

    override fun onResume() {
        super.onResume()
        syncUI()
        ContextCompat.registerReceiver(
            this, stateReceiver,
            IntentFilter(FlashlightService.BROADCAST_STATE),
            ContextCompat.RECEIVER_NOT_EXPORTED
        )
    }

    override fun onPause() {
        super.onPause()
        runCatching { unregisterReceiver(stateReceiver) }
    }

    // ── View binding ──────────────────────────────────────────────────────────

    private fun bindViews() {
        switchService     = findViewById(R.id.switchService)
        flashIcon         = findViewById(R.id.flashIcon)
        tvStatus          = findViewById(R.id.tvStatus)
        shakeMeter        = findViewById(R.id.shakeMeter)
        sliderSensitivity = findViewById(R.id.sliderSensitivity)
        tvSensLabel       = findViewById(R.id.tvSensLabel)
        switchAutoStart   = findViewById(R.id.switchAutoStart)
        switchKeepAwake   = findViewById(R.id.switchKeepAwake)
        tvSensDesc        = findViewById(R.id.tvSensDesc)
        sliderBrightness    = findViewById(R.id.sliderBrightness)
        tvBrightnessLabel   = findViewById(R.id.tvBrightnessLabel)
        tvBrightnessDesc    = findViewById(R.id.tvBrightnessDesc)
        switchSoundFeedback = findViewById(R.id.switchSoundFeedback)
        switchVibration     = findViewById(R.id.switchVibration)
        tvAutoOff           = findViewById(R.id.tvAutoOff)
        tvSoundType         = findViewById(R.id.tvSoundType)
    }

    private fun setupListeners() {
        switchService.setOnCheckedChangeListener { _, checked ->
            if (checked) startDetectionService() else stopDetectionService()
        }

        flashIcon.setOnClickListener {
            if (FlashlightService.isRunning) sendServiceAction(FlashlightService.ACTION_TOGGLE)
        }

        sliderSensitivity.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar, progress: Int, fromUser: Boolean) {
                if (!fromUser) return
                prefs.sensitivity = progress
                updateSensLabel(progress)
                if (FlashlightService.isRunning) startDetectionService()
            }
            override fun onStartTrackingTouch(sb: SeekBar) {}
            override fun onStopTrackingTouch(sb: SeekBar) {}
        })

        sliderBrightness.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(sb: SeekBar, progress: Int, fromUser: Boolean) {
                if (!fromUser) return
                val pct = progress.coerceAtLeast(1)
                prefs.brightness = pct
                updateBrightnessLabel(pct)
                if (FlashlightService.isRunning)
                    sendServiceAction(FlashlightService.ACTION_APPLY_BRIGHTNESS)
            }
            override fun onStartTrackingTouch(sb: SeekBar) {}
            override fun onStopTrackingTouch(sb: SeekBar) {}
        })

        switchSoundFeedback.setOnCheckedChangeListener { _, checked -> prefs.soundFeedback = checked }

        tvSoundType.setOnClickListener { showSoundPickerDialog() }

        switchVibration.setOnCheckedChangeListener { _, checked -> prefs.vibrationFeedback = checked }

        tvAutoOff.setOnClickListener {
            val current = autoOffOptions.indexOf(prefs.autoOffMinutes).coerceAtLeast(0)
            val next = autoOffOptions[(current + 1) % autoOffOptions.size]
            prefs.autoOffMinutes = next
            updateAutoOffLabel(next)
        }

        switchAutoStart.setOnCheckedChangeListener { _, checked -> prefs.autoStart = checked }

        switchKeepAwake.setOnCheckedChangeListener { _, checked ->
            prefs.keepAwake = checked
            if (FlashlightService.isRunning) startDetectionService()
        }

        findViewById<TextView>(R.id.btnBatteryOpt).setOnClickListener { openBatterySettings() }
    }

    // ── UI sync ───────────────────────────────────────────────────────────────

    private fun syncUI() {
        val running = FlashlightService.isRunning
        switchService.isChecked = running
        sliderSensitivity.progress = prefs.sensitivity
        updateSensLabel(prefs.sensitivity)
        sliderBrightness.progress = prefs.brightness.coerceAtLeast(1)
        updateBrightnessLabel(prefs.brightness.coerceAtLeast(1))
        updateBrightnessDesc(FlashlightService.supportsDimming)
        switchSoundFeedback.isChecked = prefs.soundFeedback
        switchVibration.isChecked     = prefs.vibrationFeedback
        updateSoundTypeLabel(prefs.soundType)
        updateAutoOffLabel(prefs.autoOffMinutes)
        switchAutoStart.isChecked = prefs.autoStart
        switchKeepAwake.isChecked = prefs.keepAwake
        updateStatusText(running)
        updateFlashIcon()
        if (!running) shakeMeter.update(0f, 0f)
    }

    private fun updateFlashIcon() {
        val running = FlashlightService.isRunning
        flashIcon.text = if (flashlightOn) "⚡" else "🔦"
        flashIcon.alpha = when {
            flashlightOn -> 1f
            running -> 0.6f
            else -> 0.25f
        }
        updateStatusText(running)
    }

    private fun updateStatusText(running: Boolean = FlashlightService.isRunning) {
        tvStatus.text = when {
            !running     -> getString(R.string.status_stopped)
            flashlightOn -> getString(R.string.status_light_on)
            else         -> getString(R.string.status_listening)
        }
    }

    private fun updateSensLabel(progress: Int) {
        tvSensLabel.text = sensLabel(progress)
        tvSensDesc.text  = sensDesc(progress)
    }

    private fun updateBrightnessLabel(pct: Int) {
        tvBrightnessLabel.text = "$pct%"
    }

    private fun updateSoundTypeLabel(index: Int) {
        val names = resources.getStringArray(R.array.sound_names)
        tvSoundType.text = names.getOrElse(index) { names[0] }
    }

    private fun showSoundPickerDialog() {
        val names = resources.getStringArray(R.array.sound_names)
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.sound_choose_title))
            .setSingleChoiceItems(names, prefs.soundType) { dialog, which ->
                prefs.soundType = which
                updateSoundTypeLabel(which)
                previewSound(which)
                dialog.dismiss()
            }
            .setNegativeButton(getString(R.string.update_later), null)
            .show()
    }

    private fun previewSound(index: Int) {
        val resId = soundResources.getOrElse(index) { soundResources[0] }
        try {
            MediaPlayer.create(this, resId)?.apply {
                setOnCompletionListener { release() }
                start()
            }
        } catch (_: Exception) {}
    }

    private fun updateAutoOffLabel(minutes: Int) {
        tvAutoOff.text = when (minutes) {
            0    -> getString(R.string.auto_off_disabled)
            1    -> getString(R.string.auto_off_1min)
            5    -> getString(R.string.auto_off_5min)
            10   -> getString(R.string.auto_off_10min)
            else -> getString(R.string.auto_off_30min)
        }
    }

    private fun updateBrightnessDesc(supported: Boolean) {
        tvBrightnessDesc.text = if (supported)
            getString(R.string.brightness_hint_supported)
        else
            getString(R.string.brightness_hint_unsupported)
    }

    private fun sensLabel(p: Int) = when {
        p < 20 -> getString(R.string.sens_very_low)
        p < 40 -> getString(R.string.sens_low)
        p < 60 -> getString(R.string.sens_medium)
        p < 80 -> getString(R.string.sens_high)
        else   -> getString(R.string.sens_very_high)
    }

    private fun sensDesc(p: Int) = when {
        p < 20 -> getString(R.string.sens_desc_very_low)
        p < 40 -> getString(R.string.sens_desc_low)
        p < 60 -> getString(R.string.sens_desc_medium)
        p < 80 -> getString(R.string.sens_desc_high)
        else   -> getString(R.string.sens_desc_very_high)
    }

    // ── Service control ───────────────────────────────────────────────────────

    private fun startDetectionService() {
        val i = Intent(this, FlashlightService::class.java).apply {
            action = FlashlightService.ACTION_START
            putExtra(FlashlightService.EXTRA_SENSITIVITY, prefs.sensitivity)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
            startForegroundService(i)
        else
            startService(i)
        prefs.serviceEnabled = true
    }

    private fun stopDetectionService() {
        sendServiceAction(FlashlightService.ACTION_STOP)
        prefs.serviceEnabled = false
        flashlightOn = false
        updateFlashIcon()
        shakeMeter.update(0f, 0f)
    }

    private fun sendServiceAction(action: String) {
        startService(Intent(this, FlashlightService::class.java).apply { this.action = action })
    }

    // ── Battery optimisation ──────────────────────────────────────────────────

    private fun openBatterySettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(POWER_SERVICE) as PowerManager
            if (pm.isIgnoringBatteryOptimizations(packageName)) {
                Toast.makeText(this, getString(R.string.battery_already_exempt), Toast.LENGTH_SHORT).show()
                return
            }
        }
        runCatching {
            startActivity(
                Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                    data = Uri.parse("package:$packageName")
                }
            )
        }.onFailure {
            startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS))
        }
    }

    // ── Update dialog ─────────────────────────────────────────────────────────

    private fun showUpdateDialog() {
        if (isFinishing || isDestroyed) return
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.update_title))
            .setMessage(getString(R.string.update_message))
            .setPositiveButton(getString(R.string.update_download)) { _, _ ->
                UpdateChecker.openDownload(this)
            }
            .setNegativeButton(getString(R.string.update_later), null)
            .show()
    }

    // ── Runtime permissions ───────────────────────────────────────────────────

    private fun requestNeededPermissions() {
        val needed = mutableListOf<String>()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU &&
            ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS)
            != PackageManager.PERMISSION_GRANTED) {
            needed += Manifest.permission.POST_NOTIFICATIONS
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            != PackageManager.PERMISSION_GRANTED) {
            needed += Manifest.permission.CAMERA
        }
        if (needed.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, needed.toTypedArray(), 100)
        }
    }
}
