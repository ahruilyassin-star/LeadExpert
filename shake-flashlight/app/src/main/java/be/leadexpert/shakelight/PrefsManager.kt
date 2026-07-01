package be.leadexpert.shakelight

import android.content.Context

class PrefsManager(context: Context) {
    private val p = context.getSharedPreferences("shakelight", Context.MODE_PRIVATE)

    var sensitivity: Int
        get() = p.getInt("sensitivity", 50)
        set(v) = p.edit().putInt("sensitivity", v).apply()

    var autoStart: Boolean
        get() = p.getBoolean("auto_start", true)
        set(v) = p.edit().putBoolean("auto_start", v).apply()

    var keepAwake: Boolean
        get() = p.getBoolean("keep_awake", true)
        set(v) = p.edit().putBoolean("keep_awake", v).apply()

    var serviceEnabled: Boolean
        get() = p.getBoolean("service_enabled", false)
        set(v) = p.edit().putBoolean("service_enabled", v).apply()

    var brightness: Int
        get() = p.getInt("brightness", 100)
        set(v) = p.edit().putInt("brightness", v).apply()

    var soundFeedback: Boolean
        get() = p.getBoolean("sound_feedback", false)
        set(v) = p.edit().putBoolean("sound_feedback", v).apply()

    var vibrationFeedback: Boolean
        get() = p.getBoolean("vibration_feedback", false)
        set(v) = p.edit().putBoolean("vibration_feedback", v).apply()

    var autoOffMinutes: Int
        get() = p.getInt("auto_off_minutes", 0)
        set(v) = p.edit().putInt("auto_off_minutes", v).apply()
}
