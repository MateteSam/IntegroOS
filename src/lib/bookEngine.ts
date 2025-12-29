import { jsPDF } from 'jspdf'
import JSZip from 'jszip'
import { generateAIImage, generateAIImageWithReference, renderSpecToDataUri } from './aiClient'
import { generateAIText } from './aiClient'

export type PageFormat = 'A4' | 'Letter' | 'A5' | 'SixByNine' | 'EightHalfByEleven' | 'Custom'
export type Quality = 'web' | 'print' | 'high-res'
export type LayoutPreset = 'arrow_chapter' | 'heritage_classic' | 'workbook_modern' | 'publisher_pro'
export type LayoutSuggestion = { preset?: LayoutPreset; pullQuotes?: { text: string }[] }
const hexToRgb = (hex: string) => { const m = hex.replace('#', ''); const r = parseInt(m.slice(0, 2), 16); const g = parseInt(m.slice(2, 4), 16); const b = parseInt(m.slice(4, 6), 16); return { r, g, b } }
type AISpec = { title?: string; palette?: string[]; style?: string; elements?: { type: 'shape'; x: number; y: number; w: number; h: number; fill: string }[]; accent?: string }

type CoverOptions = {
  title: string
  subtitle?: string
  author: string
  colors: { primary: string; secondary: string; accent1?: string; accent2?: string }
  fonts: { title: string; body: string }
  template: 'minimal' | 'modern' | 'classic' | 'big_type' | 'split_band' | 'diagonal_mask'
  format: PageFormat
  titleAlign?: 'left' | 'center'
  autoContrast?: boolean
  guides?: boolean
}

type BookContent = {
  chapters: { title: string; paragraphs: string[] }[]
}

const mmToPt = (mm: number) => mm * 2.83465
const inToMm = (inch: number) => inch * 25.4

export const getPageDimensions = (format: PageFormat, custom?: { widthMm: number; heightMm: number }) => {
  if (format === 'A4') {
    const widthMm = 210
    const heightMm = 297
    const widthPx300 = Math.round((widthMm / 25.4) * 300)
    const heightPx300 = Math.round((heightMm / 25.4) * 300)
    return { widthMm, heightMm, widthPx300, heightPx300 }
  }
  if (format === 'A5') {
    const widthMm = 148
    const heightMm = 210
    const widthPx300 = Math.round((widthMm / 25.4) * 300)
    const heightPx300 = Math.round((heightMm / 25.4) * 300)
    return { widthMm, heightMm, widthPx300, heightPx300 }
  }
  if (format === 'SixByNine') {
    const widthMm = inToMm(6)
    const heightMm = inToMm(9)
    const widthPx300 = Math.round((widthMm / 25.4) * 300)
    const heightPx300 = Math.round((heightMm / 25.4) * 300)
    return { widthMm, heightMm, widthPx300, heightPx300 }
  }
  if (format === 'EightHalfByEleven') {
    const widthMm = inToMm(8.5)
    const heightMm = inToMm(11)
    const widthPx300 = Math.round((widthMm / 25.4) * 300)
    const heightPx300 = Math.round((heightMm / 25.4) * 300)
    return { widthMm, heightMm, widthPx300, heightPx300 }
  }
  if (format === 'Custom' && custom) {
    const widthMm = custom.widthMm
    const heightMm = custom.heightMm
    const widthPx300 = Math.round((widthMm / 25.4) * 300)
    const heightPx300 = Math.round((heightMm / 25.4) * 300)
    return { widthMm, heightMm, widthPx300, heightPx300 }
  }
  const widthMm = 216
  const heightMm = 279
  const widthPx300 = Math.round((widthMm / 25.4) * 300)
  const heightPx300 = Math.round((heightMm / 25.4) * 300)
  return { widthMm, heightMm, widthPx300, heightPx300 }
}

export const generateCoverSVG = (opts: CoverOptions): string => {
  const dims = getPageDimensions(opts.format)
  const w = dims.widthPx300
  const h = dims.heightPx300
  const bg = opts.colors.primary
  const fg = opts.colors.secondary
  const accent = opts.colors.accent1 || '#f59e0b'
  const baseTitleSize = 120
  const subSize = 48
  const authorSize = 42
  const titleLen = (opts.title || '').length
  const titleSize = Math.max(72, baseTitleSize - Math.max(0, titleLen - 24) * 2)
  const titleAnchor = opts.titleAlign === 'center' ? 'middle' : 'start'
  const titleX = opts.titleAlign === 'center' ? Math.round(w * 0.5) : Math.round(w * 0.08)
  const subtitleX = opts.titleAlign === 'center' ? Math.round(w * 0.5) : Math.round(w * 0.08)
  const authorX = opts.titleAlign === 'center' ? Math.round(w * 0.5) : Math.round(w * 0.08)
  const chooseText = (hexBg: string) => {
    const { r, g, b } = hexToRgb(hexBg)
    const lum = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
    const L = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b)
    const contrast = (L + 0.05) / (0.05)
    return contrast < 4.5 ? '#111827' : '#ffffff'
  }
  const titleFill = opts.autoContrast ? chooseText(bg) : '#ffffff'
  const subtitleFill = opts.autoContrast ? (titleFill === '#ffffff' ? '#e5e7eb' : '#4b5563') : '#e5e7eb'
  const authorFill = opts.autoContrast ? (titleFill === '#ffffff' ? '#111827' : '#111827') : '#111827'
  const guides = opts.guides ? `<rect x="${Math.round(w * 0.03)}" y="${Math.round(h * 0.03)}" width="${Math.round(w * 0.94)}" height="${Math.round(h * 0.94)}" fill="none" stroke="#ef4444" stroke-width="2"/>` : ''
  if (opts.template === 'minimal') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="${bg}" />
<rect x="0" y="${Math.round(h * 0.8)}" width="${w}" height="${Math.round(h * 0.2)}" fill="${accent}" />
<text x="${titleX}" y="${Math.round(h * 0.35)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="700" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.45)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.93)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${guides}
</svg>`
  }
  if (opts.template === 'modern') {
    const bandH = Math.round(h * 0.28)
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${bg}" />
<stop offset="100%" stop-color="${accent}" />
</linearGradient>
</defs>
<rect x="0" y="0" width="${w}" height="${h}" fill="${fg}" />
<rect x="0" y="${Math.round(h * 0.18)}" width="${w}" height="${bandH}" fill="url(#g)" />
<text x="${titleX}" y="${Math.round(h * 0.35)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.42)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.92)}" fill="#e5e7eb" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${guides}
</svg>`
  }
  if (opts.template === 'big_type') {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
<linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="${bg}" />
<stop offset="100%" stop-color="${accent}" />
</linearGradient>
</defs>
<rect x="0" y="0" width="${w}" height="${h}" fill="url(#g2)" />
<text x="${titleX}" y="${Math.round(h * 0.4)}" fill="${titleFill}" font-size="${Math.max(titleSize, 140)}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.5)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.94)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${guides}
</svg>`
  }
  if (opts.template === 'split_band') {
    const bandH = Math.round(h * 0.24)
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${Math.round(h * 0.38)}" fill="${bg}" />
<rect x="0" y="${Math.round(h * 0.38)}" width="${w}" height="${bandH}" fill="${accent}" />
<rect x="0" y="${Math.round(h * 0.38) + bandH}" width="${w}" height="${h - (Math.round(h * 0.38) + bandH)}" fill="${fg}" />
<text x="${titleX}" y="${Math.round(h * 0.38) + Math.round(bandH * 0.65)}" fill="${getContrastRatio(accent, '#ffffff') >= 4.5 ? '#ffffff' : '#111827'}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.32)}" fill="${titleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.93)}" fill="#e5e7eb" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${guides}
</svg>`
  }
  if (opts.template === 'diagonal_mask') {
    const p1 = `0,${Math.round(h * 0.35)}`
    const p2 = `${w},${Math.round(h * 0.15)}`
    const p3 = `${w},0`
    const p4 = `0,0`
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="${fg}" />
<polygon points="${p4} ${p3} ${p2} ${p1}" fill="${bg}" />
<text x="${titleX}" y="${Math.round(h * 0.38)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="800" text-anchor="${titleAnchor}">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${subtitleX}" y="${Math.round(h * 0.48)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}" text-anchor="${titleAnchor}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${authorX}" y="${Math.round(h * 0.93)}" fill="#e5e7eb" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600" text-anchor="${titleAnchor}">${escapeXML(opts.author)}</text>
${guides}
</svg>`
  }
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<rect x="0" y="0" width="${w}" height="${h}" fill="#ffffff" />
<rect x="${Math.round(w * 0.1)}" y="${Math.round(h * 0.1)}" width="${Math.round(w * 0.8)}" height="${Math.round(h * 0.8)}" fill="${bg}" stroke="${fg}" />
<text x="${Math.round(w * 0.15)}" y="${Math.round(h * 0.3)}" fill="${titleFill}" font-size="${titleSize}" font-family="${opts.fonts.title}" font-weight="700">${escapeXML(opts.title)}</text>
${opts.subtitle ? `<text x="${Math.round(w * 0.15)}" y="${Math.round(h * 0.38)}" fill="${subtitleFill}" font-size="${subSize}" font-family="${opts.fonts.body}">${escapeXML(opts.subtitle)}</text>` : ''}
<text x="${Math.round(w * 0.15)}" y="${Math.round(h * 0.85)}" fill="${authorFill}" font-size="${authorSize}" font-family="${opts.fonts.body}" font-weight="600">${escapeXML(opts.author)}</text>
${guides}
</svg>`
}

export const renderCoverPNG300DPI = async (svg: string, format: PageFormat): Promise<string> => {
  const dims = getPageDimensions(format)
  const img = new Image()
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('cover image failed to load'))
    img.src = url
  })
  const canvas = document.createElement('canvas')
  canvas.width = dims.widthPx300
  canvas.height = dims.heightPx300
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  return canvas.toDataURL('image/png')
}

export const renderCoverCanvasBasic = async (opts: CoverOptions): Promise<string> => {
  const dims = getPageDimensions(opts.format)
  const canvas = document.createElement('canvas')
  canvas.width = dims.widthPx300
  canvas.height = dims.heightPx300
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const bg = opts.colors.primary
  const fg = opts.colors.secondary
  const accent = opts.colors.accent1 || '#f59e0b'
  const baseTitleSize = 120
  const titleLen = (opts.title || '').length
  const titleSize = Math.max(72, baseTitleSize - Math.max(0, titleLen - 24) * 2)
  const subSize = 48
  const authorSize = 42
  const chooseText = (hexBg: string) => {
    const { r, g, b } = hexToRgb(hexBg)
    const lum = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
    const L = 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b)
    const contrast = (L + 0.05) / (0.05)
    return contrast < 4.5 ? '#111827' : '#ffffff'
  }
  const titleFill = opts.autoContrast ? chooseText(bg) : '#ffffff'
  const subtitleFill = opts.autoContrast ? (titleFill === '#ffffff' ? '#e5e7eb' : '#4b5563') : '#e5e7eb'
  const authorFill = '#111827'
  const align = opts.titleAlign === 'center' ? 'center' : 'left'
  ctx.textAlign = align as CanvasTextAlign
  ctx.textBaseline = 'alphabetic'
  const wrap = (text: string, max: number) => {
    const words = String(text || '').split(/\s+/)
    const lines: string[] = []
    let buf = ''
    for (const w of words) {
      const test = buf ? buf + ' ' + w : w
      if (ctx.measureText(test).width <= max) buf = test
      else { if (buf) lines.push(buf); buf = w }
    }
    if (buf) lines.push(buf)
    return lines
  }
  const drawLines = (lines: string[], x: number, y: number, lh: number) => {
    for (let i = 0; i < lines.length; i++) { ctx.fillText(lines[i], x, y + i * lh) }
  }
  const maxTextWidth = Math.round(opts.titleAlign === 'center' ? canvas.width * 0.82 : canvas.width * 0.84)
  const titleX = opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.08)
  const subX = titleX
  if (opts.template === 'minimal') {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = accent; ctx.fillRect(0, Math.round(canvas.height * 0.8), canvas.width, Math.round(canvas.height * 0.2))
    ctx.fillStyle = titleFill; ctx.font = `700 ${titleSize}px ${opts.fonts.title}`; const tLines = wrap(opts.title, maxTextWidth); drawLines(tLines, titleX, Math.round(canvas.height * 0.35), Math.round(titleSize * 0.95))
    if (opts.subtitle) { ctx.fillStyle = subtitleFill; ctx.font = `400 ${subSize}px ${opts.fonts.body}`; const sLines = wrap(opts.subtitle, maxTextWidth); drawLines(sLines, subX, Math.round(canvas.height * 0.45), Math.round(subSize * 1.05)) }
    ctx.fillStyle = authorFill; ctx.font = `600 ${authorSize}px ${opts.fonts.body}`; ctx.fillText(opts.author, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.93))
  } else if (opts.template === 'modern') {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, fg); grad.addColorStop(1, fg)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height)
    const bandH = Math.round(canvas.height * 0.28)
    const grad2 = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad2.addColorStop(0, bg); grad2.addColorStop(1, accent)
    ctx.fillStyle = grad2; ctx.fillRect(0, Math.round(canvas.height * 0.18), canvas.width, bandH)
    ctx.fillStyle = titleFill; ctx.font = `800 ${titleSize}px ${opts.fonts.title}`; ctx.fillText(opts.title, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.06), Math.round(canvas.height * 0.35))
    if (opts.subtitle) { ctx.fillStyle = subtitleFill; ctx.font = `400 ${subSize}px ${opts.fonts.body}`; ctx.fillText(opts.subtitle, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.06), Math.round(canvas.height * 0.42)) }
    ctx.fillStyle = '#e5e7eb'; ctx.font = `600 ${authorSize}px ${opts.fonts.body}`; ctx.fillText(opts.author, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.06), Math.round(canvas.height * 0.92))
  } else if (opts.template === 'classic') {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = bg; ctx.strokeStyle = fg; const padX = Math.round(canvas.width * 0.1); const padY = Math.round(canvas.height * 0.1)
    ctx.fillRect(padX, padY, Math.round(canvas.width * 0.8), Math.round(canvas.height * 0.8))
    ctx.strokeRect(padX, padY, Math.round(canvas.width * 0.8), Math.round(canvas.height * 0.8))
    ctx.fillStyle = titleFill; ctx.font = `700 ${titleSize}px ${opts.fonts.title}`; ctx.fillText(opts.title, Math.round(canvas.width * 0.15), Math.round(canvas.height * 0.3))
    if (opts.subtitle) { ctx.fillStyle = subtitleFill; ctx.font = `400 ${subSize}px ${opts.fonts.body}`; ctx.fillText(opts.subtitle, Math.round(canvas.width * 0.15), Math.round(canvas.height * 0.38)) }
    ctx.fillStyle = authorFill; ctx.font = `600 ${authorSize}px ${opts.fonts.body}`; ctx.fillText(opts.author, Math.round(canvas.width * 0.15), Math.round(canvas.height * 0.85))
  } else if (opts.template === 'big_type') {
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, bg); grad.addColorStop(1, accent)
    ctx.fillStyle = grad; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = titleFill; ctx.font = `800 ${Math.max(titleSize, 140)}px ${opts.fonts.title}`; const tLines = wrap(opts.title, maxTextWidth); drawLines(tLines, titleX, Math.round(canvas.height * 0.4), Math.round(Math.max(titleSize, 140) * 0.9))
    if (opts.subtitle) { ctx.fillStyle = subtitleFill; ctx.font = `400 ${subSize}px ${opts.fonts.body}`; const sLines = wrap(opts.subtitle, maxTextWidth); drawLines(sLines, subX, Math.round(canvas.height * 0.5), Math.round(subSize * 1.05)) }
    ctx.fillStyle = authorFill; ctx.font = `600 ${authorSize}px ${opts.fonts.body}`; ctx.fillText(opts.author, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.94))
  } else if (opts.template === 'split_band') {
    const topH = Math.round(canvas.height * 0.38)
    const bandH = Math.round(canvas.height * 0.24)
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, topH)
    ctx.fillStyle = accent; ctx.fillRect(0, topH, canvas.width, bandH)
    ctx.fillStyle = fg; ctx.fillRect(0, topH + bandH, canvas.width, canvas.height - (topH + bandH))
    const bandText = getContrastRatio(accent, '#ffffff') >= 4.5 ? '#ffffff' : '#111827'
    ctx.fillStyle = bandText; ctx.font = `800 ${titleSize}px ${opts.fonts.title}`; const tLines = wrap(opts.title, maxTextWidth); drawLines(tLines, titleX, topH + Math.round(bandH * 0.65), Math.round(titleSize * 0.95))
    if (opts.subtitle) { ctx.fillStyle = titleFill; ctx.font = `400 ${subSize}px ${opts.fonts.body}`; ctx.fillText(opts.subtitle, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.32)) }
    ctx.fillStyle = '#e5e7eb'; ctx.font = `600 ${authorSize}px ${opts.fonts.body}`; ctx.fillText(opts.author, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.93))
  } else if (opts.template === 'diagonal_mask') {
    ctx.fillStyle = fg; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.moveTo(0, Math.round(canvas.height * 0.35))
    ctx.lineTo(canvas.width, Math.round(canvas.height * 0.15))
    ctx.lineTo(canvas.width, 0)
    ctx.lineTo(0, 0)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = titleFill; ctx.font = `800 ${titleSize}px ${opts.fonts.title}`; const tLines = wrap(opts.title, maxTextWidth); drawLines(tLines, titleX, Math.round(canvas.height * 0.38), Math.round(titleSize * 0.95))
    if (opts.subtitle) { ctx.fillStyle = subtitleFill; ctx.font = `400 ${subSize}px ${opts.fonts.body}`; const sLines = wrap(opts.subtitle, maxTextWidth); drawLines(sLines, subX, Math.round(canvas.height * 0.48), Math.round(subSize * 1.05)) }
    ctx.fillStyle = '#e5e7eb'; ctx.font = `600 ${authorSize}px ${opts.fonts.body}`; ctx.fillText(opts.author, opts.titleAlign === 'center' ? Math.round(canvas.width * 0.5) : Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.93))
  } else {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = titleFill; ctx.font = `700 ${titleSize}px ${opts.fonts.title}`; const tLines = wrap(opts.title, maxTextWidth); drawLines(tLines, Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.35), Math.round(titleSize * 0.95))
    if (opts.subtitle) { ctx.fillStyle = subtitleFill; ctx.font = `400 ${subSize}px ${opts.fonts.body}`; const sLines = wrap(opts.subtitle, maxTextWidth); drawLines(sLines, Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.45), Math.round(subSize * 1.05)) }
    ctx.fillStyle = authorFill; ctx.font = `600 ${authorSize}px ${opts.fonts.body}`; ctx.fillText(opts.author, Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.93))
  }
  return canvas.toDataURL('image/png')
}

export const renderCoverCanvasComposite = async (opts: CoverOptions, refDataUrl: string): Promise<string> => {
  const dims = getPageDimensions(opts.format)
  const canvas = document.createElement('canvas')
  canvas.width = dims.widthPx300
  canvas.height = dims.heightPx300
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('ref-bg-load')); img.src = refDataUrl })
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
  const dw = Math.round(img.width * scale)
  const dh = Math.round(img.height * scale)
  const dx = Math.round((canvas.width - dw) / 2)
  const dy = Math.round((canvas.height - dh) / 2)
  ctx.filter = 'blur(6px) saturate(1.05)'
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.filter = 'none'
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1
  // Draw template foreground text/shapes using basic renderer on top
  const fgPNG = await renderCoverCanvasBasic(opts)
  const fgImg = new Image()
  await new Promise<void>((resolve) => { fgImg.onload = () => resolve(); fgImg.src = fgPNG })
  ctx.drawImage(fgImg, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/png')
}

export const safeGenerateCoverPNG = async (opts: CoverOptions, refDataUrl?: string): Promise<string> => {
  try {
    const svg = generateCoverSVG(opts)
    if (refDataUrl) return await composeCoverWithReference(svg, refDataUrl, opts.format)
    return await renderCoverPNG300DPI(svg, opts.format)
  } catch {
    try {
      if (refDataUrl) return await renderCoverCanvasComposite(opts, refDataUrl)
      return await renderCoverCanvasBasic(opts)
    } catch {
      const dims = getPageDimensions(opts.format)
      const c = document.createElement('canvas'); c.width = dims.widthPx300; c.height = dims.heightPx300
      const ctx = c.getContext('2d') as CanvasRenderingContext2D
      ctx.fillStyle = opts.colors.primary || '#1e40af'; ctx.fillRect(0, 0, c.width, c.height)
      ctx.fillStyle = '#ffffff'; ctx.font = `700 120px ${opts.fonts.title}`; ctx.fillText(opts.title || 'Title', Math.round(c.width * 0.08), Math.round(c.height * 0.35))
      ctx.fillStyle = '#111827'; ctx.font = `600 42px ${opts.fonts.body}`; ctx.fillText(opts.author || 'Author', Math.round(c.width * 0.08), Math.round(c.height * 0.93))
      return c.toDataURL('image/png')
    }
  }
}

export const generateAICoverPNG = async (prompt: string, format: PageFormat): Promise<string> => {
  const dims = getPageDimensions(format)
  const res = await generateAIImage(prompt)
  if (res.text === 'spec' && res.imageUrl) {
    return await renderSpecToDataUri(res.imageUrl, dims.widthPx300, dims.heightPx300)
  }
  return ''
}

export const generateAICoverPNGWithReference = async (prompt: string, format: PageFormat, refDataUrl?: string): Promise<string> => {
  const dims = getPageDimensions(format)
  const res = await generateAIImageWithReference(prompt, refDataUrl)
  if (res.text === 'spec' && res.imageUrl) {
    return await renderSpecToDataUri(res.imageUrl, dims.widthPx300, dims.heightPx300)
  }
  return ''
}

export const generateArtCoverFromReference = async (title: string, subtitle: string | undefined, author: string, format: PageFormat, refDataUrl: string): Promise<string> => {
  const dims = getPageDimensions(format)
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('ref load')); img.src = refDataUrl })
  const canvas = document.createElement('canvas')
  canvas.width = dims.widthPx300
  canvas.height = dims.heightPx300
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const scale = Math.max(canvas.width / img.width, canvas.height / img.height)
  const dw = Math.round(img.width * scale)
  const dh = Math.round(img.height * scale)
  const dx = Math.round((canvas.width - dw) / 2)
  const dy = Math.round((canvas.height - dh) / 2)
  ctx.filter = 'blur(8px) saturate(1.1)'
  ctx.drawImage(img, dx, dy, dw, dh)
  const { palette } = await analyzeReferenceImage(refDataUrl)
  const p = palette && palette.length ? palette : ['#111827', '#1f2937', '#374151']
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  grad.addColorStop(0, p[0])
  grad.addColorStop(1, p[1] || p[0])
  ctx.globalAlpha = 0.35
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 0.9
  const cols = 12
  const rows = 16
  const cw = Math.ceil(canvas.width / cols)
  const ch = Math.ceil(canvas.height / rows)
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const sx = Math.min(canvas.width - 1, x * cw + Math.floor(Math.random() * cw * 0.3))
      const sy = Math.min(canvas.height - 1, y * ch + Math.floor(Math.random() * ch * 0.3))
      const c = ctx.getImageData(sx, sy, 1, 1).data
      const hex = `#${[c[0], c[1], c[2]].map(v => v.toString(16).padStart(2, '0')).join('')}`
      ctx.fillStyle = hex
      const rw = Math.max(8, Math.floor(cw * (0.2 + Math.random() * 0.6)))
      const rh = Math.max(8, Math.floor(ch * (0.2 + Math.random() * 0.6)))
      const rx = x * cw + Math.floor(Math.random() * (cw - rw))
      const ry = y * ch + Math.floor(Math.random() * (ch - rh))
      ctx.globalAlpha = 0.18
      ctx.fillRect(rx, ry, rw, rh)
    }
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = '#ffffff'
  ctx.font = '800 140px Inter'
  ctx.fillText(title.slice(0, 40), Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.35))
  if (subtitle) { ctx.font = '400 56px Inter'; ctx.fillStyle = '#e5e7eb'; ctx.fillText(subtitle.slice(0, 60), Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.45)) }
  ctx.font = '600 48px Inter'
  ctx.fillStyle = '#111827'
  ctx.fillText(author.slice(0, 40), Math.round(canvas.width * 0.08), Math.round(canvas.height * 0.93))
  return canvas.toDataURL('image/png')
}

export const composeCoverWithReference = async (svg: string, refDataUrl: string | undefined, format: PageFormat): Promise<string> => {
  const dims = getPageDimensions(format)
  if (!refDataUrl) return renderCoverPNG300DPI(svg, format)
  const bg = new Image()
  bg.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => { bg.onload = () => resolve(); bg.onerror = () => reject(new Error('ref load')); bg.src = refDataUrl })
  const canvas = document.createElement('canvas')
  canvas.width = dims.widthPx300
  canvas.height = dims.heightPx300
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  const scale = Math.max(canvas.width / bg.width, canvas.height / bg.height)
  const dw = Math.round(bg.width * scale)
  const dh = Math.round(bg.height * scale)
  const dx = Math.round((canvas.width - dw) / 2)
  const dy = Math.round((canvas.height - dh) / 2)
  ctx.filter = 'blur(6px) saturate(1.05)'
  ctx.drawImage(bg, dx, dy, dw, dh)
  ctx.globalAlpha = 0.35
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.globalAlpha = 1
  const img = new Image()
  const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(svgBlob)
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('cover svg')); img.src = url })
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  URL.revokeObjectURL(url)
  return canvas.toDataURL('image/png')
}

export const generateLayoutPDF = async (content: BookContent, format: PageFormat, fonts: { heading: string; body: string }, quality: Quality): Promise<string> => {
  const dims = getPageDimensions(format)
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [mmToPt(dims.widthMm), mmToPt(dims.heightMm)] })
  let y = 72
  pdf.setFont(fonts.heading, 'bold')
  pdf.setFontSize(18)
  for (let i = 0; i < content.chapters.length; i++) {
    const ch = content.chapters[i]
    const pageMargin = 72
    if (i > 0) pdf.addPage()
    y = pageMargin
    pdf.text(ch.title, pageMargin, y)
    y += 24
    pdf.setFont(fonts.body, 'normal')
    pdf.setFontSize(12)
    const maxWidth = mmToPt(dims.widthMm) - pageMargin * 2
    for (const p of ch.paragraphs) {
      const lines = pdf.splitTextToSize(p, maxWidth)
      for (const line of lines) {
        if (y > mmToPt(dims.heightMm) - pageMargin) {
          pdf.addPage()
          y = pageMargin
        }
        pdf.text(line, pageMargin, y)
        y += 18
      }
      y += 6
    }
  }
  if (quality === 'web') pdf.setProperties({ title: 'Book', subject: 'Web quality' })
  if (quality === 'print') pdf.setProperties({ title: 'Book', subject: 'Print quality' })
  if (quality === 'high-res') pdf.setProperties({ title: 'Book', subject: 'High-res quality' })
  return pdf.output('datauristring')
}

export const parseManuscript = (text: string): BookContent => {
  const lines = text.split(/\r?\n/)
  const chapters: { title: string; paragraphs: string[] }[] = []
  let currentTitle = ''
  let buffer: string[] = []
  const flushChapter = () => { if (!currentTitle) currentTitle = 'Chapter'; const paras = buffer.join('\n').split(/\n{2,}/).map(s => s.trim()).filter(Boolean); if (paras.length) chapters.push({ title: currentTitle, paragraphs: paras }); buffer = [] }
  for (const line of lines) {
    const t = line.trim()
    if (/^(#|##|###)\s+/.test(t) || /^chapter\b/i.test(t)) { flushChapter(); currentTitle = t.replace(/^(#|##|###)\s+/, '') || t }
    else buffer.push(line)
  }
  flushChapter()
  if (!chapters.length) chapters.push({ title: 'Manuscript', paragraphs: text.split(/\n{2,}/).map(s => s.trim()).filter(Boolean) })
  return { chapters }
}

export const generateLayoutFromText = async (contentText: string, opts: { title: string; author: string; format: PageFormat; fonts: { heading: string; body: string }; quality: Quality; preset?: LayoutPreset; style?: { dropCapLines?: number; bandColor?: string; ruleThickness?: number }; alignment?: 'left' | 'justify'; showHeaders?: boolean; showFooters?: boolean; showPageNumbers?: boolean; pullQuotes?: { text: string; atParagraph?: number; position?: 'inline' | 'sidebarLeft' | 'sidebarRight' }[]; cropMarks?: boolean; bleedMm?: number }): Promise<string> => {
  // Map common font names to jsPDF standard fonts
  const mapFont = (fontName: string, weight: 'normal' | 'bold' | 'italic' = 'normal') => {
    const lowerFont = fontName.toLowerCase()
    if (lowerFont.includes('times') || lowerFont.includes('serif')) {
      return weight === 'bold' ? 'times' : weight === 'italic' ? 'times' : 'times'
    } else if (lowerFont.includes('helvetica') || lowerFont.includes('sans')) {
      return weight === 'bold' ? 'helvetica' : weight === 'italic' ? 'helvetica' : 'helvetica'
    } else if (lowerFont.includes('courier') || lowerFont.includes('mono')) {
      return weight === 'bold' ? 'courier' : weight === 'italic' ? 'courier' : 'courier'
    }
    return weight === 'bold' ? 'helvetica' : weight === 'italic' ? 'helvetica' : 'helvetica'
  }
  const dims = getPageDimensions(opts.format)
  const pageW = mmToPt(dims.widthMm)
  const pageH = mmToPt(dims.heightMm)
  const bleedPt = mmToPt(Math.max(0, opts.bleedMm || 0))
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: [pageW + bleedPt * 2, pageH + bleedPt * 2] })
  const margin = 72
  const headerY = bleedPt + 48
  const footerY = bleedPt + pageH - 36
  const maxWidth = pageW - margin * 2
  const toc: { title: string; page: number }[] = []
  const ruleThickness = opts.style?.ruleThickness ?? (opts.preset === 'workbook_modern' ? 1 : 0.6)
  const twoColumns = opts.preset === 'workbook_modern' || opts.preset === 'publisher_pro'
  const gutter = twoColumns ? 24 : 0
  const colW = twoColumns ? (pageW - margin * 2 - gutter) / 2 : maxWidth
  const colXs = [bleedPt + margin, bleedPt + margin + colW + gutter]
  let colIndex = 0

  // Helpers
  const measure = (s: string) => pdf.getTextWidth(s)

  const drawJustifiedLine = (line: string, x: number, y: number, width: number) => {
    const words = line.split(/\s+/)
    if (words.length <= 1) { pdf.text(line, x, y); return }
    const spaceW = measure(' ')
    const textW = words.reduce((sum, w) => sum + measure(w), 0)
    const gaps = words.length - 1
    const extra = Math.max(0, width - textW)
    const addPerGap = gaps > 0 ? extra / gaps : 0
    let cx = x
    for (let i = 0; i < words.length; i++) {
      const w = words[i]
      pdf.text(w, cx, y)
      if (i < words.length - 1) cx += measure(w) + spaceW + addPerGap
    }
  }

  // Title Page
  pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold')
  pdf.setFontSize(28)
  const titleW = pdf.getTextWidth(opts.title)
  pdf.text(opts.title, bleedPt + (pageW - titleW) / 2, bleedPt + pageH * 0.38)
  pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal')
  pdf.setFontSize(16)
  const authorW = pdf.getTextWidth(opts.author)
  pdf.text(opts.author, bleedPt + (pageW - authorW) / 2, bleedPt + pageH * 0.45)
  pdf.setDrawColor(180)
  pdf.setLineWidth(ruleThickness)
  pdf.line(bleedPt + margin, bleedPt + pageH * 0.5, bleedPt + pageW - margin, bleedPt + pageH * 0.5)

  // TOC Setup
  const chapters = parseManuscript(contentText).chapters
  const entriesPerPage = Math.floor((pageH - margin * 2 - 60) / 18)
  const tocPagesNeeded = Math.ceil(chapters.length / entriesPerPage) || 1

  // Insert TOC Placeholders
  const tocStartPage = pdf.getNumberOfPages() + 1
  for (let i = 0; i < tocPagesNeeded; i++) {
    pdf.addPage()
    if (i === 0) {
      pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold')
      pdf.setFontSize(22)
      pdf.text('Contents', bleedPt + margin, bleedPt + margin)
    }
  }

  // Content Generation
  let y = bleedPt + margin

  const advance = () => {
    if (y > footerY - margin) {
      if (twoColumns && colIndex === 0) { colIndex = 1; y = bleedPt + margin; return }
      pdf.addPage(); colIndex = 0; y = bleedPt + margin
      // Header
      if (opts.showHeaders !== false) {
        // Simple header for now, can be improved
        pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal')
        pdf.setFontSize(10)
        // pdf.text(opts.title, bleedPt + margin, headerY - 20)
      }
    }
  }

  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i]
    pdf.addPage()
    colIndex = 0
    y = bleedPt + margin

    // Record TOC
    toc.push({ title: ch.title, page: pdf.getNumberOfPages() })

    // Chapter Header
    if (opts.preset === 'arrow_chapter') {
      pdf.setDrawColor(160)
      pdf.setLineWidth(ruleThickness + 1.4)
      if (opts.showHeaders !== false) {
        pdf.line(bleedPt + margin, headerY - 28, bleedPt + margin, headerY + 60)
        pdf.setFont(mapFont(opts.fonts.body, 'bold'), 'bold')
        pdf.setFontSize(11)
        pdf.text('CHAPTER', bleedPt + margin + 8, headerY - 8)
        pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold')
        pdf.setFontSize(56)
        pdf.text(String(i + 1), bleedPt + margin + 32, headerY + 32)
        pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold')
        pdf.setFontSize(26)
        const tw = pdf.getTextWidth(ch.title)
        const cx = bleedPt + (pageW - tw) / 2
        pdf.text(ch.title, cx, headerY + 18)
      }
      y = bleedPt + margin + 48
    } else if (opts.preset === 'heritage_classic') {
      if (opts.showHeaders !== false) {
        pdf.setFont(mapFont(opts.fonts.heading, 'italic'), 'italic')
        pdf.setFontSize(28)
        pdf.text(ch.title, bleedPt + margin, headerY)
        pdf.setDrawColor(200)
        pdf.setLineWidth(0.6)
        pdf.line(bleedPt + margin, headerY + 8, bleedPt + pageW - margin, headerY + 8)
      }
      y = bleedPt + margin + 24
    } else if (opts.preset === 'workbook_modern') {
      const band = opts.style?.bandColor || '#22c55e'
      const rgb = hexToRgb(band)
      if (opts.showHeaders !== false) {
        pdf.setFillColor(rgb.r, rgb.g, rgb.b)
        pdf.rect(bleedPt + pageW - margin - 180, bleedPt + margin, 180, 90, 'F')
        pdf.setFont(mapFont(opts.fonts.body, 'bold'), 'bold')
        pdf.setTextColor(255)
        pdf.setFontSize(12)
        pdf.text('CHAPTER', bleedPt + pageW - margin - 160, bleedPt + margin + 28)
        pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold')
        pdf.setFontSize(40)
        pdf.text(String(i + 1).padStart(2, '0'), bleedPt + pageW - margin - 90, bleedPt + margin + 68)
        pdf.setTextColor(0)
        pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold')
        pdf.setFontSize(22)
        pdf.text(ch.title, bleedPt + margin, headerY)
      }
      y = bleedPt + margin + 36
    } else {
      if (opts.showHeaders !== false) {
        pdf.setFont(mapFont(opts.fonts.heading, 'bold'), 'bold')
        pdf.setFontSize(18)
        pdf.text(ch.title, bleedPt + margin, headerY)
        pdf.setDrawColor(220)
        pdf.setLineWidth(ruleThickness)
        pdf.line(bleedPt + margin, headerY + 8, bleedPt + pageW - margin, headerY + 8)
      }
      y = bleedPt + margin + 24
    }

    // Paragraphs
    const lineHeight = 18
    let paraIndex = 0

    for (const p of ch.paragraphs) {
      const isFirst = paraIndex === 0
      pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal')
      pdf.setFontSize(12)

      // Pull Quotes
      const scheduledQuotes = (opts.pullQuotes || []).filter(q => (q.atParagraph || 0) === (paraIndex + 1))
      for (const q of scheduledQuotes) {
        const boxW = twoColumns ? colW : maxWidth
        const boxH = 80
        const pos = q.position || 'inline'
        // Logic for sidebar positioning could be added here
        // For now, inline
        if (y + boxH > footerY - margin) advance()

        pdf.setDrawColor(210)
        pdf.setFillColor(245, 245, 245)
        pdf.rect(colXs[colIndex], y, boxW, boxH, 'FD')
        pdf.setFont(mapFont(opts.fonts.body, 'italic'), 'italic')
        pdf.setTextColor(70)
        const qLines = pdf.splitTextToSize(`“${q.text}”`, boxW - 24)
        pdf.text(qLines, colXs[colIndex] + 12, y + 24)
        pdf.setTextColor(0)
        y += boxH + 16
        pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal')
      }

      // Drop Cap
      let indentLines = 0
      let indentWidth = 0

      if (isFirst) {
        const dropLines = opts.style?.dropCapLines ?? (opts.preset === 'heritage_classic' ? 3 : 2)
        if (dropLines > 1) {
          const dropChar = p.trim().charAt(0)
          const dropFontSize = dropLines * lineHeight + (opts.preset === 'heritage_classic' ? 6 : 2)

          pdf.setFont(mapFont(opts.fonts.heading, opts.preset === 'heritage_classic' ? 'italic' : 'bold'), opts.preset === 'heritage_classic' ? 'italic' : 'bold')
          pdf.setFontSize(dropFontSize)
          const dropW = measure(dropChar)

          // Draw Drop Cap
          const dropY = y + dropLines * lineHeight - 6
          pdf.text(dropChar, colXs[colIndex], dropY)

          indentLines = dropLines
          indentWidth = dropW + 6

          // Reset font
          pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal')
          pdf.setFontSize(12)
        }
      }

      // Layout Paragraph Text
      const text = isFirst && indentLines > 0 ? p.trim().slice(1).trim() : p.trim()
      const words = text.split(/\s+/)
      let curLine: string[] = []
      let lineCount = 0

      for (let wIdx = 0; wIdx < words.length; wIdx++) {
        const w = words[wIdx]
        const effectiveW = (lineCount < indentLines) ? (twoColumns ? colW : maxWidth) - indentWidth : (twoColumns ? colW : maxWidth)

        const test = curLine.length ? curLine.join(' ') + ' ' + w : w
        if (measure(test) <= effectiveW) {
          curLine.push(w)
        } else {
          // Draw Line
          if (y > footerY - margin) {
            advance()
            // If we advanced, indent is lost for subsequent lines usually, but drop cap stays on previous page?
            // Actually drop cap should stay with text. If we break page inside drop cap, it's messy.
            // For now assume drop cap fits.
            if (lineCount < indentLines) {
              // If we broke page, we shouldn't indent anymore as drop cap is on prev page
              indentLines = 0
              indentWidth = 0
            }
          }

          const effectiveX = (lineCount < indentLines) ? colXs[colIndex] + indentWidth : colXs[colIndex]
          const lineStr = curLine.join(' ')

          if (opts.alignment === 'justify' && wIdx < words.length - 1) { // Don't justify last line of paragraph
            drawJustifiedLine(lineStr, effectiveX, y, effectiveW)
          } else {
            pdf.text(lineStr, effectiveX, y)
          }

          y += lineHeight
          lineCount++
          curLine = [w]
        }
      }
      // Last line
      if (curLine.length) {
        if (y > footerY - margin) advance()
        const effectiveX = (lineCount < indentLines) ? colXs[colIndex] + indentWidth : colXs[colIndex]
        pdf.text(curLine.join(' '), effectiveX, y)
        y += lineHeight
      }

      y += 6 // Paragraph spacing
      paraIndex++
    }

    // Footer line for workbook
    if (opts.preset === 'workbook_modern' && opts.showFooters !== false) {
      pdf.setDrawColor(220)
      pdf.setLineWidth(ruleThickness)
      pdf.line(bleedPt + margin, footerY - 24, bleedPt + pageW - margin, footerY - 24)
    }
  }

  // Fill TOC
  for (let t = 0; t < tocPagesNeeded; t++) {
    pdf.setPage(tocStartPage + t)
    let tocY = bleedPt + margin + (t === 0 ? 36 : 0)

    const startIdx = t * entriesPerPage
    const endIdx = Math.min((t + 1) * entriesPerPage, toc.length)

    pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal')
    pdf.setFontSize(12)

    for (let i = startIdx; i < endIdx; i++) {
      const item = toc[i]
      pdf.text(item.title, bleedPt + margin, tocY)
      const pStr = String(item.page)
      const pW = measure(pStr)
      pdf.text(pStr, bleedPt + pageW - margin - pW, tocY)

      // Leader
      const titleW = measure(item.title)
      const leaderW = pageW - margin * 2 - titleW - pW - 10
      if (leaderW > 0) {
        const dots = Math.floor(leaderW / measure('.'))
        const leader = new Array(dots).fill('.').join('')
        pdf.text(leader, bleedPt + margin + titleW + 5, tocY)
      }

      tocY += 18
    }
  }

  // Page Numbers
  if (opts.showPageNumbers !== false) {
    const pages = pdf.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i)
      pdf.setFont(mapFont(opts.fonts.body, 'normal'), 'normal')
      pdf.setFontSize(10)
      const num = String(i)
      const tw = pdf.getTextWidth(num)
      if (opts.preset === 'arrow_chapter') {
        pdf.text(num, bleedPt + pageW - margin, footerY)
      } else if (opts.preset === 'heritage_classic') {
        pdf.text(num, bleedPt + (pageW - tw) / 2, footerY)
      } else if (opts.preset === 'workbook_modern') {
        pdf.text(num, bleedPt + margin, footerY)
      } else {
        pdf.text(num, bleedPt + (pageW - tw) / 2, footerY)
      }
    }
  }

  // Crop Marks
  if (opts.cropMarks) {
    const len = 18
    const lw = 0.6
    const pages = pdf.getNumberOfPages()
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i)
      pdf.setDrawColor(0)
      pdf.setLineWidth(lw)
      pdf.line(bleedPt, bleedPt, bleedPt + len, bleedPt)
      pdf.line(bleedPt, bleedPt, bleedPt, bleedPt + len)
      pdf.line(bleedPt + pageW, bleedPt, bleedPt + pageW - len, bleedPt)
      pdf.line(bleedPt + pageW, bleedPt, bleedPt + pageW, bleedPt + len)
      pdf.line(bleedPt, bleedPt + pageH, bleedPt + len, bleedPt + pageH)
      pdf.line(bleedPt, bleedPt + pageH, bleedPt, bleedPt + pageH - len)
      pdf.line(bleedPt + pageW, bleedPt + pageH, bleedPt + pageW - len, bleedPt + pageH)
      pdf.line(bleedPt + pageW, bleedPt + pageH, bleedPt + pageW, bleedPt + pageH - len)
    }
  }

  pdf.setProperties({ title: opts.title, subject: 'Book Layout' })
  return pdf.output('datauristring')
}

export const analyzeContentForLayout = async (text: string): Promise<LayoutSuggestion> => {
  try {
    const prompt = `Analyze the following book content and propose: 1) best layout preset among [publisher_pro, arrow_chapter, heritage_classic, workbook_modern], 2) up to 2 short pull quotes.
Return ONLY JSON: {"preset":"...","pullQuotes":[{"text":"..."}]}
Content:\n${text.slice(0, 4000)}`
    const res = await generateAIText(prompt)
    const cleaned = (res.text || '').replace(/```json\n?|```/g, '').trim()
    const obj = JSON.parse(cleaned || '{}')
    const preset: LayoutPreset = ['publisher_pro', 'arrow_chapter', 'heritage_classic', 'workbook_modern'].includes(obj.preset) ? obj.preset : 'publisher_pro'
    const pullQuotes = Array.isArray(obj.pullQuotes) ? obj.pullQuotes.slice(0, 2).map((q: any) => ({ text: String(q.text || '') })) : []
    return { preset, pullQuotes }
  } catch {
    const lower = text.toLowerCase()
    if (/(question|exercise|write|list)/.test(lower)) return { preset: 'workbook_modern', pullQuotes: [] }
    if (/(history|biography|classic|heritage)/.test(lower)) return { preset: 'heritage_classic', pullQuotes: [] }
    return { preset: 'publisher_pro', pullQuotes: [] }
  }
}

export const validateOutputs = (coverPNG: string, pdfDataUri: string) => {
  const coverOk = (() => {
    const img = new Image()
    img.src = coverPNG
    const w = Number((coverPNG.match(/data:image\/png;base64/) ? atob(coverPNG.split(',')[1]).length : 0))
    return img.width > 1500 && img.height > 2000
  })()
  const pdfOk = pdfDataUri.startsWith('data:application/pdf')
  return { coverOk, pdfOk }
}

export const buildMockups = async (coverPNG: string) => {
  const sizes = [
    { name: 'instagram', w: 1080, h: 1080 },
    { name: 'twitter_header', w: 1500, h: 500 },
    { name: 'linkedin_banner', w: 1584, h: 396 }
  ]
  const out: Record<string, string> = {}
  for (const s of sizes) {
    const canvas = document.createElement('canvas')
    canvas.width = s.w
    canvas.height = s.h
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
    ctx.fillStyle = '#111827'
    ctx.fillRect(0, 0, s.w, s.h)
    const img = new Image()
    img.crossOrigin = 'anonymous'
    await new Promise<void>((resolve) => {
      img.onload = () => resolve()
      img.src = coverPNG
    })
    const ratio = Math.min(s.w / img.width, s.h / img.height)
    const dw = Math.round(img.width * ratio)
    const dh = Math.round(img.height * ratio)
    const dx = Math.round((s.w - dw) / 2)
    const dy = Math.round((s.h - dh) / 2)
    ctx.drawImage(img, dx, dy, dw, dh)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 28px Inter'
    ctx.fillText('Book Mockup', 24, s.h - 32)
    out[s.name] = canvas.toDataURL('image/png')
  }
  return out
}

export const exportEPUB = async (content: BookContent, meta: { title: string; author: string }) => {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  const metaInf = zip.folder('META-INF')
  metaInf?.file('container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)
  const oebps = zip.folder('OEBPS')
  oebps?.file('styles.css', `body{font-family:serif;line-height:1.6;margin:1rem;color:#111} h1{font-size:1.6rem;margin:1rem 0} p{margin:0.8rem 0}`)
  const chapters = content.chapters.map((ch, i) => ({
    id: `chap${i + 1}`, href: `chap${i + 1}.xhtml`, xml: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXML(ch.title)}</title><meta charset="utf-8"/><link rel="stylesheet" type="text/css" href="styles.css"/></head>
<body><h1>${escapeXML(ch.title)}</h1>${ch.paragraphs.map(p => `<p>${escapeXML(p)}</p>`).join('')}</body>
</html>` }))
  chapters.forEach(c => oebps?.file(c.href, c.xml))
  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Navigation</title><meta charset="utf-8"/></head>
<body><nav epub:type="toc"><ol>${chapters.map(c => `<li><a href="${c.href}">${c.id}</a></li>`).join('')}</ol></nav></body>
</html>`
  oebps?.file('nav.xhtml', nav)
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${Date.now()}</dc:identifier>
    <dc:title>${escapeXML(meta.title)}</dc:title>
    <dc:creator>${escapeXML(meta.author)}</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    ${chapters.map(c => `<item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"/>`).join('')}
  </manifest>
  <spine>
    ${chapters.map(c => `<itemref idref="${c.id}"/>`).join('')}
  </spine>
</package>`
  oebps?.file('content.opf', opf)
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  const url = URL.createObjectURL(blob)
  return url
}

export const analyzeReferenceImage = async (url: string) => {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  await new Promise<void>((resolve, reject) => { img.onload = () => resolve(); img.onerror = () => reject(new Error('ref image')); img.src = url })
  const canvas = document.createElement('canvas')
  canvas.width = Math.min(256, img.width)
  canvas.height = Math.min(256, img.height)
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const buckets: Record<string, number> = {}
  for (let i = 0; i < data.length; i += 4) { const r = data[i], g = data[i + 1], b = data[i + 2]; const key = `${Math.round(r / 32) * 32},${Math.round(g / 32) * 32},${Math.round(b / 32) * 32}`; buckets[key] = (buckets[key] || 0) + 1 }
  const top = Object.entries(buckets).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => { const [r, g, b] = k.split(',').map(Number); const hex = `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`; return hex })
  return { palette: top }
}

export const suggestLayoutFromPalette = (palette: string[]): LayoutPreset => {
  const toRgb = (hex: string) => {
    const m = hex.replace('#', '')
    const r = parseInt(m.slice(0, 2), 16), g = parseInt(m.slice(2, 4), 16), b = parseInt(m.slice(4, 6), 16)
    return { r, g, b }
  }
  const sat = (r: number, g: number, b: number) => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    return max === 0 ? 0 : (max - min) / max
  }
  const sats = palette.slice(0, 3).map(h => { const { r, g, b } = toRgb(h); return sat(r, g, b) })
  const avgSat = sats.length ? sats.reduce((a, b) => a + b, 0) / sats.length : 0
  if (avgSat > 0.35) return 'workbook_modern'
  if (avgSat < 0.12) return 'heritage_classic'
  return 'publisher_pro'
}

export const preflightCheckPDF = (pdfDataUri: string, expected: { format: PageFormat }) => {
  const okMime = pdfDataUri.startsWith('data:application/pdf')
  const issues: string[] = []
  if (!okMime) issues.push('Invalid PDF MIME')
  return { ok: okMime && issues.length === 0, issues }
}

export const validateContentFlow = (text: string) => {
  const issues: string[] = []
  const chapters = parseManuscript(text).chapters
  if (chapters.length < 1) issues.push('No chapters detected')
  for (const ch of chapters) {
    if (!ch.title || ch.title.length < 3) issues.push(`Chapter missing title`)
    ch.paragraphs.forEach((p, idx) => {
      const words = p.trim().split(/\s+/)
      if (words.length < 10) issues.push(`Paragraph ${idx + 1} in "${ch.title}" is very short`)
      if (/\S{18,}/.test(p)) issues.push(`Paragraph ${idx + 1} in "${ch.title}" contains extremely long tokens`)
      const sentences = p.split(/[.!?]\s/).filter(s => s.trim().length > 0)
      if (sentences.length < 2) issues.push(`Paragraph ${idx + 1} in "${ch.title}" has few sentences`)
    })
  }
  return { ok: issues.length === 0, issues }
}

export const overlayCoverWithLogo = async (coverPNG: string, logoDataURL: string): Promise<string> => {
  const base = new Image()
  const logo = new Image()
  base.crossOrigin = 'anonymous'
  logo.crossOrigin = 'anonymous'
  await new Promise<void>(resolve => { base.onload = () => resolve(); base.src = coverPNG })
  await new Promise<void>(resolve => { logo.onload = () => resolve(); logo.src = logoDataURL })
  const canvas = document.createElement('canvas')
  canvas.width = base.width
  canvas.height = base.height
  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D
  ctx.drawImage(base, 0, 0)
  const lw = Math.round(canvas.width * 0.2)
  const ratio = lw / logo.width
  const lh = Math.round(logo.height * ratio)
  const dx = Math.round(canvas.width * 0.75)
  const dy = Math.round(canvas.height * 0.08)
  ctx.globalAlpha = 0.95
  ctx.drawImage(logo, dx, dy, lw, lh)
  return canvas.toDataURL('image/png')
}

export const getContrastRatio = (bgHex: string, textHex: string) => {
  const a = hexToRgb(bgHex)
  const b = hexToRgb(textHex)
  const lum = (c: number) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
  const L1 = 0.2126 * lum(a.r) + 0.7152 * lum(a.g) + 0.0722 * lum(a.b)
  const L2 = 0.2126 * lum(b.r) + 0.7152 * lum(b.g) + 0.0722 * lum(b.b)
  const high = Math.max(L1, L2)
  const low = Math.min(L1, L2)
  return (high + 0.05) / (low + 0.05)
}

export const exportEPUBBlob = async (content: BookContent, meta: { title: string; author: string }): Promise<Blob> => {
  const zip = new JSZip()
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' })
  const metaInf = zip.folder('META-INF')
  metaInf?.file('container.xml', `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`)
  const oebps = zip.folder('OEBPS')
  oebps?.file('styles.css', `body{font-family:serif;line-height:1.6;margin:1rem;color:#111} h1{font-size:1.6rem;margin:1rem 0} p{margin:0.8rem 0}`)
  const chapters = content.chapters.map((ch, i) => ({
    id: `chap${i + 1}`, href: `chap${i + 1}.xhtml`, xml: `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml">
<head><title>${escapeXML(ch.title)}</title><meta charset="utf-8"/><link rel="stylesheet" type="text/css" href="styles.css"/></head>
<body><h1>${escapeXML(ch.title)}</h1>${ch.paragraphs.map(p => `<p>${escapeXML(p)}</p>`).join('')}</body>
</html>` }))
  chapters.forEach(c => oebps?.file(c.href, c.xml))
  const nav = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Navigation</title><meta charset="utf-8"/></head>
<body><nav epub:type="toc"><ol>${chapters.map(c => `<li><a href="${c.href}">${c.id}</a></li>`).join('')}</ol></nav></body>
</html>`
  oebps?.file('nav.xhtml', nav)
  const opf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${Date.now()}</dc:identifier>
    <dc:title>${escapeXML(meta.title)}</dc:title>
    <dc:creator>${escapeXML(meta.author)}</dc:creator>
    <meta property="dcterms:modified">${new Date().toISOString()}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    <item id="css" href="styles.css" media-type="text/css"/>
    ${chapters.map(c => `<item id="${c.id}" href="${c.href}" media-type="application/xhtml+xml"/>`).join('')}
  </manifest>
  <spine>
    ${chapters.map(c => `<itemref idref="${c.id}"/>`).join('')}
  </spine>
</package>`
  oebps?.file('content.opf', opf)
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' })
  return blob
}

export const exportDOCXBlob = async (content: BookContent, meta: { title: string; author: string }): Promise<Blob> => {
  const zip = new JSZip()
  zip.file('[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`)
  const rels = zip.folder('_rels')
  rels?.file('.rels', `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`)
  const docProps = zip.folder('docProps')
  docProps?.file('core.xml', `<?xml version="1.0" encoding="UTF-8"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>${escapeXML(meta.title)}</dc:title>
  <dc:creator>${escapeXML(meta.author)}</dc:creator>
  <cp:lastModifiedBy>AI Book Studio</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">${new Date().toISOString()}</dcterms:modified>
</cp:coreProperties>`)
  docProps?.file('app.xml', `<?xml version="1.0" encoding="UTF-8"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>AI Book Studio</Application>
</Properties>`)
  const word = zip.folder('word')
  const paragraphs = content.chapters.flatMap(ch => [ch.title, ...ch.paragraphs])
  const pXml = paragraphs.map(t => `<w:p><w:r><w:t>${escapeXML(t)}</w:t></w:r></w:p>`).join('')
  word?.file('document.xml', `<?xml version="1.0" encoding="UTF-8"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>${pXml}<w:sectPr/></w:body>
</w:document>`)
  const blob = await zip.generateAsync({ type: 'blob' })
  return blob
}

export const exportBookProject = async (payload: { title: string; author: string; coverPNG?: string; pdfDataUri?: string; epubBlob?: Blob; settings: any; logs?: any[] }) => {
  const zip = new JSZip()
  const meta = {
    title: payload.title,
    author: payload.author,
    createdAt: new Date().toISOString(),
    settings: payload.settings
  }
  zip.file('metadata.json', JSON.stringify(meta, null, 2))
  if (payload.coverPNG) zip.file('cover.png', payload.coverPNG.split(',')[1], { base64: true })
  if (payload.pdfDataUri) zip.file('book.pdf', payload.pdfDataUri.split(',')[1], { base64: true })
  if (payload.epubBlob) zip.file('book.epub', payload.epubBlob)
  if (payload.logs) zip.file('logs.json', JSON.stringify(payload.logs, null, 2))
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${payload.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_project.zip`
  a.click()
  URL.revokeObjectURL(url)
}

export const importDOCXToText = async (file: Blob | File | ArrayBuffer): Promise<string> => {
  try {
    const zip = new JSZip()
    const data = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer()
    const z = await zip.loadAsync(data)
    const docXml = z.file('word/document.xml')
    if (!docXml) return ''
    const xmlStr = await docXml.async('string')

    // Extract text from <w:t> nodes, separate paragraphs on </w:p>
    const texts: string[] = []
    const paraSplit = xmlStr.split(/<\/?w:p[\s\S]*?>/)

    for (const chunk of paraSplit) {
      const parts = [...chunk.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map(m => m[1])
      const line = parts.join('')
      const cleaned = line.replace(/\s+/g, ' ').trim()
      if (cleaned) texts.push(cleaned)
    }

    // Join paragraphs and clean up excessive spacing
    let result = texts.join('\n\n').trim()
    result = result.replace(/\n{3,}/g, '\n\n') // Remove excessive blank lines

    // Try to detect potential chapters based on formatting
    const lines = result.split('\n');
    const enhancedLines = lines.map((line, index) => {
      const trimmed = line.trim();

      // Detect potential chapter titles
      if (trimmed.length > 0 && trimmed.length < 100 && (
        /^[A-Z][A-Z\s]{2,}$/.test(trimmed) || // ALL CAPS
        /^Chapter\s+\d+/i.test(trimmed) || // "Chapter 1"
        /^[A-Z][a-zA-Z\s]{2,50}$/.test(trimmed) && index > 0 && lines[index - 1].trim() === '' // Title with blank line before
      )) {
        return `# ${trimmed}`; // Add chapter marker
      }
      return line;
    });

    return enhancedLines.join('\n');
  } catch (error) {
    console.error('DOCX text extraction error:', error)
    return ''
  }
}

export const importPDFAsDataURI = async (file: Blob | File | ArrayBuffer): Promise<string> => {
  const blob = file instanceof ArrayBuffer ? new Blob([file], { type: 'application/pdf' }) : (file as Blob)
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new Error('pdf import failed'))
    reader.readAsDataURL(blob)
  })
}

export const extractTextFromPDF = async (file: Blob | File | ArrayBuffer): Promise<string> => {
  try {
    const data = file instanceof ArrayBuffer ? file : await (file as Blob).arrayBuffer()
    const pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.mjs')
    // @ts-ignore
    const workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.js'
    // @ts-ignore
    if (pdfjs.GlobalWorkerOptions) pdfjs.GlobalWorkerOptions.workerSrc = workerSrc
    // @ts-ignore
    const doc = await pdfjs.getDocument({ data }).promise
    let out = ''

    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()

      // Group text by vertical position to better preserve paragraph structure
      const items = content.items.map((it: any) => ({
        str: it.str,
        transform: it.transform,
        y: it.transform[5], // Y coordinate
        x: it.transform[4], // X coordinate
        height: it.height || 0,
      }))

      // Sort by Y position (top to bottom), then by X position (left to right)
      items.sort((a: any, b: any) => {
        if (Math.abs(a.y - b.y) < 5) return a.x - b.x // Same line, sort by X
        return b.y - a.y // Different lines, sort by Y
      })

      // Group into lines and paragraphs
      let currentLine = ''
      let lastY = items[0]?.y || 0
      const paragraphs: string[] = []
      let lineSpacing = 0

      for (const item of items) {
        const spacing = Math.abs(item.y - lastY)

        if (spacing > 15) {
          // New paragraph detected (larger spacing)
          if (currentLine.trim()) {
            paragraphs.push(currentLine.trim())
          }
          currentLine = item.str
          lineSpacing = spacing
        } else if (spacing > 5) {
          // New line but same paragraph
          if (currentLine.trim()) {
            currentLine += ' ' + item.str
          } else {
            currentLine = item.str
          }
        } else {
          // Same line or very close
          if (item.x > 0 && currentLine && !currentLine.endsWith(' ')) {
            currentLine += ' ' // Add space between words on same line
          }
          currentLine += item.str
        }
        lastY = item.y
      }

      // Add final line
      if (currentLine.trim()) {
        paragraphs.push(currentLine.trim())
      }

      // Join paragraphs with double newlines for better layout processing
      out += paragraphs.join('\n\n') + '\n\n'
    }

    // Clean up and enhance the text for better layout generation
    let cleanedText = out.trim().replace(/\n{3,}/g, '\n\n') // Remove excessive blank lines

    // Try to detect potential chapters based on formatting
    const lines = cleanedText.split('\n');
    const enhancedLines = lines.map((line, index) => {
      const trimmed = line.trim();

      // Detect potential chapter titles
      if (trimmed.length > 0 && trimmed.length < 100 && (
        /^[A-Z][A-Z\s]{2,}$/.test(trimmed) || // ALL CAPS
        /^Chapter\s+\d+/i.test(trimmed) || // "Chapter 1"
        /^[A-Z][a-zA-Z\s]{2,50}$/.test(trimmed) && index > 0 && lines[index - 1].trim() === '' // Title with blank line before
      )) {
        return `# ${trimmed}`; // Add chapter marker
      }
      return line;
    });

    return enhancedLines.join('\n');
  } catch (error) {
    console.error('PDF text extraction error:', error)
    return ''
  }
}

const escapeXML = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const exportLayoutEditablePackage = async (contentText: string, opts: { title: string; author: string; format: PageFormat; fonts: { heading: string; body: string }; preset?: LayoutPreset; style?: { dropCapLines?: number; bandColor?: string; ruleThickness?: number }; alignment?: 'left' | 'justify' }) => {
  const dims = getPageDimensions(opts.format)
  const pageW = Math.round((dims.widthMm / 25.4) * 96)
  const pageH = Math.round((dims.heightMm / 25.4) * 96)
  const margin = Math.round(96 * (72 / 72))
  const maxWidth = pageW - margin * 2
  const ruleThickness = opts.style?.ruleThickness ?? 0.6
  const twoColumns = opts.preset === 'workbook_modern' || opts.preset === 'publisher_pro'
  const gutter = twoColumns ? Math.round(96 * (24 / 72)) : 0
  const colW = twoColumns ? Math.round((pageW - margin * 2 - gutter) / 2) : maxWidth
  const colXs = [margin, margin + colW + gutter]
  let colIndex = 0
  const chapters = parseManuscript(contentText).chapters
  const zip = new JSZip()
  const pages: { svg: string }[] = []
  const measureCanvas = document.createElement('canvas')
  const ctx = measureCanvas.getContext('2d') as CanvasRenderingContext2D
  ctx.font = `12px ${opts.fonts.body}`
  const measure = (s: string) => ctx.measureText(s).width
  const composeLines = (text: string, width: number) => {
    const words = text.split(/\s+/)
    const lines: string[] = []
    let cur = ''
    for (let w of words) {
      const test = cur ? cur + ' ' + w : w
      if (measure(test) <= width) { cur = test; continue }
      if (!cur) { lines.push(w); cur = '' } else { lines.push(cur); cur = w }
    }
    if (cur) lines.push(cur)
    return lines
  }
  const makePage = (elements: string[]) => {
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${pageW} ${pageH}" width="${pageW}" height="${pageH}">\n<rect x="0" y="0" width="${pageW}" height="${pageH}" fill="#ffffff" />\n${elements.join('\n')}\n</svg>`
    pages.push({ svg })
  }
  let y = margin
  let elements: string[] = []
  for (let i = 0; i < chapters.length; i++) {
    if (elements.length) { makePage(elements); elements = []; y = margin; colIndex = 0 }
    elements.push(`<text x="${margin}" y="${margin}" fill="#000000" font-size="22" font-family="${opts.fonts.heading}" font-weight="700">${escapeXML(chapters[i].title)}</text>`)
    y = margin + Math.round(96 * (24 / 72))
    for (const p of chapters[i].paragraphs) {
      const lines = composeLines(p, twoColumns ? colW : maxWidth)
      for (let li = 0; li < lines.length; li++) {
        const line = lines[li]
        elements.push(`<text x="${colXs[colIndex]}" y="${y}" fill="#000000" font-size="12" font-family="${opts.fonts.body}">${escapeXML(line)}</text>`)
        y += Math.round(96 * (18 / 72))
        if (y > pageH - margin) {
          if (twoColumns && colIndex === 0) { colIndex = 1; y = margin }
          else { makePage(elements); elements = []; colIndex = 0; y = margin; elements.push(`<text x="${margin}" y="${margin}" fill="#000000" font-size="16" font-family="${opts.fonts.body}">${escapeXML(chapters[i].title)}</text>`) }
        }
      }
      y += Math.round(96 * (6 / 72))
    }
  }
  if (elements.length) makePage(elements)
  pages.forEach((p, idx) => zip.file(`page${String(idx + 1).padStart(3, '0')}.svg`, p.svg))
  const meta = { title: opts.title, author: opts.author, pages: pages.length, width: pageW, height: pageH, columns: twoColumns ? 2 : 1, ruleThickness }
  zip.file('manifest.json', JSON.stringify(meta, null, 2))
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${opts.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_layout_editable.zip`
  a.click()
  URL.revokeObjectURL(url)
}