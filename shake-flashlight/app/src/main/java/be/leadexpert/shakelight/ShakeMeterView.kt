package be.leadexpert.shakelight

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View

/**
 * Custom horizontal bar that shows:
 *   - Blue fill = current shake magnitude (smoothed)
 *   - Orange dashed line = trigger threshold position
 *   - Turns green when threshold is crossed (about to trigger)
 */
class ShakeMeterView @JvmOverloads constructor(
    context: Context,
    attrs: AttributeSet? = null,
    defStyleAttr: Int = 0
) : View(context, attrs, defStyleAttr) {

    private var level = 0f        // 0.0 – 1.0: normalised shake magnitude
    private var score = 0f        // 0.0 – 1.0: event count progress toward trigger

    private val bgPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#12122A")
        style = Paint.Style.FILL
    }

    private val barPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
    }

    private val thresholdPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        color = Color.parseColor("#E2934A")
        style = Paint.Style.STROKE
        strokeWidth = dpToPx(2f)
        pathEffect = DashPathEffect(floatArrayOf(dpToPx(6f), dpToPx(4f)), 0f)
    }

    private val scoreGlow = Paint(Paint.ANTI_ALIAS_FLAG).apply {
        style = Paint.Style.FILL
        color = Color.parseColor("#334AE2A0")
    }

    private val rect = RectF()

    // Call this from the broadcast receiver / sensor callback
    fun update(magnitude: Float, shakeScore: Float) {
        // Normalise magnitude: 0 m/s² → 0, 45 m/s² → 1.0
        level = (magnitude / 45f).coerceIn(0f, 1f)
        score = shakeScore.coerceIn(0f, 1f)

        // Colour shifts blue → green as score builds up
        val r = lerp(0x4A, 0x4A, score).toInt()
        val g = lerp(0x90, 0xE2, score).toInt()
        val b = lerp(0xE2, 0xA0, score).toInt()
        barPaint.color = Color.rgb(r, g, b)

        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        val w = width.toFloat()
        val h = height.toFloat()
        val radius = h / 2f

        // Background track
        rect.set(0f, 0f, w, h)
        canvas.drawRoundRect(rect, radius, radius, bgPaint)

        // Score glow overlay (full width, behind bar)
        if (score > 0f) {
            rect.set(0f, 0f, w * score, h)
            canvas.drawRoundRect(rect, radius, radius, scoreGlow)
        }

        // Main magnitude bar
        if (level > 0f) {
            rect.set(0f, 0f, w * level, h)
            canvas.drawRoundRect(rect, radius, radius, barPaint)
        }

        // Threshold indicator line at 55% (approximate trigger zone start)
        val tx = w * 0.55f
        canvas.drawLine(tx, dpToPx(2f), tx, h - dpToPx(2f), thresholdPaint)
    }

    private fun lerp(a: Int, b: Int, t: Float) = a + (b - a) * t
    private fun dpToPx(dp: Float) = dp * context.resources.displayMetrics.density
}
