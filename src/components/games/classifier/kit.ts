/**
 * أدوات رسم مشتركة للوحات ألعاب التصنيف (مساحة منطقية 300×200).
 * تحافظ على مظهر موحّد: خلفية داكنة بتدرّج، عناصر بخطوط واضحة، وحركة هادئة.
 */
import type { G } from "./types"

/** خلفية اللوحة: تدرّج عمودي بين لونين */
export function bg(g: G, top: string, bottom: string) {
  const grad = g.createLinearGradient(0, 0, 0, 200)
  grad.addColorStop(0, top)
  grad.addColorStop(1, bottom)
  g.fillStyle = grad
  g.fillRect(0, 0, 300, 200)
}

/** جسيمات صغيرة تطفو ببطء لإضفاء الحياة على الخلفية */
export function motes(g: G, ph: number, color: string, n = 10) {
  for (let i = 0; i < n; i++) {
    const x = (i * 71 + ph * 6 * (1 + (i % 3))) % 320 - 10
    const y = 20 + ((i * 53) % 160) + Math.sin(ph + i) * 4
    g.fillStyle = color
    g.globalAlpha = 0.25 + 0.15 * Math.sin(ph * 2 + i)
    g.beginPath()
    g.arc(x, y, 1.5 + (i % 3), 0, 7)
    g.fill()
  }
  g.globalAlpha = 1
}

/** شكل بيضاوي متموّج (غشاء خلية، فجوة، ...) */
export function blob(g: G, cx: number, cy: number, rx: number, ry: number, ph: number, wob = 3, k = 5) {
  g.beginPath()
  for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.12) {
    const r = 1 + (wob / Math.max(rx, ry)) * Math.sin(a * k + ph * 2)
    const x = cx + Math.cos(a) * rx * r
    const y = cy + Math.sin(a) * ry * r
    if (a === 0) g.moveTo(x, y)
    else g.lineTo(x, y)
  }
  g.closePath()
}

/** هالة مضيئة نابضة حول نقطة لتمييز الجزء المقصود في الرسم */
export function glow(g: G, x: number, y: number, r: number, ph: number, color = "#ffe27a") {
  const pulse = 1 + 0.12 * Math.sin(ph * 4)
  const rad = g.createRadialGradient(x, y, 0, x, y, r * pulse)
  rad.addColorStop(0, color)
  rad.addColorStop(1, "rgba(0,0,0,0)")
  g.globalAlpha = 0.55
  g.fillStyle = rad
  g.beginPath()
  g.arc(x, y, r * pulse, 0, 7)
  g.fill()
  g.globalAlpha = 1
}

/** سهم أبيض بإطار داكن، يتأرجح قليلًا مع الزمن */
export function arrow(g: G, x: number, y: number, ang: number, ph: number, len = 1) {
  g.save()
  g.translate(x, y)
  g.rotate(ang)
  g.scale(len, len)
  g.translate(Math.sin(ph * 4) * 3, 0)
  g.lineJoin = "round"
  g.beginPath()
  g.moveTo(-15, -4)
  g.lineTo(3, -4)
  g.lineTo(3, -10)
  g.lineTo(17, 0)
  g.lineTo(3, 10)
  g.lineTo(3, 4)
  g.lineTo(-15, 4)
  g.closePath()
  g.fillStyle = "#fff"
  g.strokeStyle = "#07141d"
  g.lineWidth = 2
  g.stroke()
  g.fill()
  g.restore()
}

/** خط منحنٍ ناعم عبر نقاط */
export function curve(g: G, pts: [number, number][]) {
  g.beginPath()
  g.moveTo(pts[0][0], pts[0][1])
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2
    const my = (pts[i][1] + pts[i + 1][1]) / 2
    g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my)
  }
  const l = pts[pts.length - 1]
  g.lineTo(l[0], l[1])
}
