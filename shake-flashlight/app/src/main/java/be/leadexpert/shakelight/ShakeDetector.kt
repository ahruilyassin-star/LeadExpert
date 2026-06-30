package be.leadexpert.shakelight

import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import kotlin.math.abs
import kotlin.math.sqrt

/**
 * Smart shake detector that discriminates intentional shaking from walking/running.
 *
 * Core algorithm:
 * 1. High-pass filter strips gravity → only dynamic acceleration remains.
 * 2. Compute 3-axis magnitude of dynamic acceleration.
 * 3. Require multi-axis activity (X AND Z must both be significant).
 *    Walking/running is mostly vertical (Y-axis); intentional shaking moves X and Z too.
 * 4. Accumulate "shake events" (threshold crossings with minimum spacing) in a sliding window.
 * 5. Trigger when enough events accumulate within the window — cooldown prevents re-trigger.
 */
class ShakeDetector(
    private val sensorManager: SensorManager,
    private val onShake: () -> Unit,
    private val onIntensityUpdate: ((magnitude: Float, score: Float) -> Unit)? = null
) : SensorEventListener {

    companion object {
        // High-pass filter coefficient: 0.9 = strongly removes slow drift / gravity tilt changes.
        // Lower values (e.g. 0.8) remove less → more sensitive to slow movements (bad for walking).
        private const val HP_ALPHA = 0.90f

        // Minimum force in X AND Z axes to qualify as multi-axis shake (m/s²).
        // Walking barely moves X/Z; deliberate shaking moves all three axes.
        private const val MULTI_AXIS_MIN = 8.0f

        // Sensitivity range: maps sensitivity 0–100 to magnitude thresholds.
        // These are high-pass-filtered magnitudes in m/s².
        // Walking typically produces 5–15 m/s²; deliberate shaking 20–50 m/s².
        private const val THRESHOLD_HARDEST = 36f  // sensitivity = 0
        private const val THRESHOLD_EASIEST = 20f  // sensitivity = 100

        // Required shake event count range (events in window needed to trigger).
        private const val EVENTS_HARDEST = 6        // sensitivity = 0
        private const val EVENTS_EASIEST = 3        // sensitivity = 100

        // Sliding window duration: collect events in this time span (ms).
        private const val WINDOW_MS = 1000L

        // Minimum spacing between consecutive events (ms).
        // Prevents the same peak from being counted multiple times at 50 Hz sampling.
        private const val MIN_EVENT_GAP_MS = 100L

        // Post-trigger cooldown: no second trigger for this long (ms).
        private const val COOLDOWN_MS = 2500L
    }

    // Sensitivity 0–100 (set by user preference)
    var sensitivity: Int = 50

    // High-pass filter state
    private var filtX = 0f; private var filtY = 0f; private var filtZ = 0f
    private var prevX = 0f; private var prevY = 0f; private var prevZ = 0f
    private var initialized = false

    // Shake event timestamps in current window
    private val events = ArrayDeque<Long>()
    private var lastEventTime = 0L
    private var lastTriggerTime = 0L

    // Smoothed intensity for UI meter
    private var smoothedMagnitude = 0f

    private val linearAccelSensor: Sensor? =
        sensorManager.getDefaultSensor(Sensor.TYPE_LINEAR_ACCELERATION)
    private val accelSensor: Sensor? =
        sensorManager.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)

    val isAvailable: Boolean get() = linearAccelSensor != null || accelSensor != null

    fun start() {
        // Prefer linear acceleration (hardware-filtered gravity removal) when available
        val sensor = linearAccelSensor ?: accelSensor ?: return
        sensorManager.registerListener(this, sensor, SensorManager.SENSOR_DELAY_GAME)
    }

    fun stop() {
        sensorManager.unregisterListener(this)
        events.clear()
        initialized = false
        smoothedMagnitude = 0f
    }

    fun reset() {
        events.clear()
        smoothedMagnitude = 0f
    }

    override fun onSensorChanged(event: SensorEvent) {
        val rawX = event.values[0]
        val rawY = event.values[1]
        val rawZ = event.values[2]

        val dX: Float
        val dY: Float
        val dZ: Float

        if (event.sensor.type == Sensor.TYPE_LINEAR_ACCELERATION) {
            // Hardware already removed gravity — use directly
            dX = rawX; dY = rawY; dZ = rawZ
        } else {
            // Software high-pass filter to strip gravity
            if (!initialized) {
                filtX = rawX; filtY = rawY; filtZ = rawZ
                prevX = rawX; prevY = rawY; prevZ = rawZ
                initialized = true
                return
            }
            filtX = HP_ALPHA * (filtX + rawX - prevX)
            filtY = HP_ALPHA * (filtY + rawY - prevY)
            filtZ = HP_ALPHA * (filtZ + rawZ - prevZ)
            prevX = rawX; prevY = rawY; prevZ = rawZ
            dX = filtX; dY = filtY; dZ = filtZ
        }

        val magnitude = sqrt(dX * dX + dY * dY + dZ * dZ)

        // Smooth for UI display (exponential moving average)
        smoothedMagnitude = smoothedMagnitude * 0.75f + magnitude * 0.25f

        val now = System.currentTimeMillis()

        // Remove expired events from window
        while (events.isNotEmpty() && now - events.first() > WINDOW_MS) {
            events.removeFirst()
        }

        // Compute per-sensitivity thresholds
        val t = sensitivity / 100f
        val threshold = THRESHOLD_HARDEST + t * (THRESHOLD_EASIEST - THRESHOLD_HARDEST)
        val requiredEvents = (EVENTS_HARDEST + t * (EVENTS_EASIEST - EVENTS_HARDEST)).toInt()
            .coerceIn(EVENTS_EASIEST, EVENTS_HARDEST)

        // Score for UI (0.0 – 1.0): how full the event window is
        val score = (events.size.toFloat() / requiredEvents).coerceIn(0f, 1f)

        onIntensityUpdate?.invoke(smoothedMagnitude, score)

        // Multi-axis gate: deliberate shaking moves X and Z (horizontal) significantly.
        // Walking/running mainly accelerates along Y (vertical) — filtered out here.
        val xzActive = abs(dX) > MULTI_AXIS_MIN && abs(dZ) > MULTI_AXIS_MIN

        if (magnitude > threshold && xzActive && now - lastEventTime >= MIN_EVENT_GAP_MS) {
            events.addLast(now)
            lastEventTime = now
        }

        // Trigger check
        if (events.size >= requiredEvents && now - lastTriggerTime >= COOLDOWN_MS) {
            lastTriggerTime = now
            events.clear()
            onShake()
        }
    }

    override fun onAccuracyChanged(sensor: Sensor, accuracy: Int) {}
}
