// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Deploy Engine
// One-click deployment to Cloudflare Pages & HTML export
// ═══════════════════════════════════════════════════════════════

import type { EditorState, EditorBlock } from './editorEngine';
import type {
  NavBlockData, HeroBlockData, StatsBlockData, ServicesBlockData,
  AboutBlockData, TestimonialsBlockData, PricingBlockData, GalleryBlockData,
  FaqBlockData, ContactBlockData, CtaBannerBlockData, FooterBlockData,
} from './editorEngine';

// ── Deploy Status ───────────────────────────────────────────
export type DeployStatus = 'idle' | 'building' | 'uploading' | 'deploying' | 'live' | 'error';

export interface DeployResult {
  status: DeployStatus;
  url?: string;
  error?: string;
  projectName?: string;
  deployId?: string;
}

// ── Generate complete static HTML from EditorState ──────────
export function generateStaticHTML(state: EditorState): string {
  const { settings: s, blocks } = state;
  const isDark = s.bgColor === '#0a0a14' || s.bgColor === '#0a0a0a' || s.bgColor.startsWith('#0');
  const visibleBlocks = blocks.filter(b => b.visible);

  const navBlock = visibleBlocks.find(b => b.type === 'nav');
  const navData = navBlock?.data as NavBlockData | undefined;
  const siteName = navData?.siteName || 'My Site';

  let sectionsHtml = '';
  for (const block of visibleBlocks) {
    sectionsHtml += renderBlockToHTML(block, s, isDark);
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteName}</title>
  <meta name="description" content="Built with Integro WebStudio">
  <meta name="generator" content="Integro WebStudio by WCCCS">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@400;600;700;800&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body { font-family: ${s.fontBody}; color: ${s.textColor}; background: ${s.bgColor}; line-height: 1.6; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    img { max-width: 100%; height: auto; }
    a { text-decoration: none; color: inherit; }
    .btn-primary { background: ${s.primaryColor}; color: ${isDark ? '#0a0a14' : '#fff'}; padding: 14px 32px; border: none; border-radius: ${s.borderRadius}px; font-weight: 700; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: transform 0.2s, box-shadow 0.2s; }
    .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 24px ${s.primaryColor}40; }
    .btn-secondary { background: transparent; border: 1px solid ${s.primaryColor}50; color: ${s.primaryColor}; padding: 14px 32px; border-radius: ${s.borderRadius}px; font-weight: 700; font-size: 14px; cursor: pointer; }
    .section-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: ${s.primaryColor}; margin-bottom: 12px; }
    .section-title { font-family: ${s.fontHeading}; font-size: clamp(28px, 4vw, 42px); font-weight: 800; line-height: 1.15; margin-bottom: 16px; }
    .card { background: ${isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}; border-radius: ${s.borderRadius}px; padding: 32px; transition: transform 0.2s; }
    .card:hover { transform: translateY(-4px); }
    @media (max-width: 768px) { .grid-responsive { grid-template-columns: 1fr !important; } }
  </style>
</head>
<body>
${sectionsHtml}
</body>
</html>`;
}

// ── Render individual block to HTML ─────────────────────────
function renderBlockToHTML(block: EditorBlock, s: EditorState['settings'], isDark: boolean): string {
  switch (block.type) {
    case 'nav': {
      const d = block.data as NavBlockData;
      return `<nav style="padding:16px 0;border-bottom:1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'};position:sticky;top:0;z-index:100;backdrop-filter:blur(16px);background:${s.bgColor}cc">
  <div class="container" style="display:flex;align-items:center;justify-content:space-between">
    ${d.logoUrl ? `<img src="${d.logoUrl}" alt="${d.siteName}" style="max-height:36px">` : `<span style="font-family:${s.fontHeading};font-size:22px;font-weight:800;color:${s.primaryColor}">${d.siteName}</span>`}
    <div style="display:flex;align-items:center;gap:28px">
      ${d.links.map(l => `<a href="#" style="color:${s.textColor}aa;font-size:14px;font-weight:500">${l}</a>`).join('')}
      <button class="btn-primary" style="padding:10px 24px;font-size:13px">${d.ctaText}</button>
    </div>
  </div>
</nav>`;
    }
    case 'hero': {
      const d = block.data as HeroBlockData;
      const bg = d.backgroundImage
        ? `background:linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.7)),url('${d.backgroundImage}') center/cover`
        : `background:linear-gradient(135deg,${s.secondaryColor} 0%,${s.bgColor} 100%)`;
      return `<section style="min-height:85vh;display:flex;align-items:center;justify-content:center;text-align:center;${bg};position:relative;overflow:hidden">
  <div class="container" style="position:relative;z-index:2">
    ${d.badge ? `<span class="section-eyebrow">✦ ${d.badge}</span>` : ''}
    <h1 style="font-family:${s.fontHeading};font-size:clamp(36px,5vw,64px);font-weight:800;line-height:1.08;letter-spacing:-0.03em;margin-bottom:20px">${d.title}</h1>
    <p style="font-size:18px;color:${s.textColor}90;max-width:600px;margin:0 auto 36px">${d.subtitle}</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <button class="btn-primary">${d.ctaText} →</button>
      ${d.secondaryCtaText ? `<button class="btn-secondary">▶ ${d.secondaryCtaText}</button>` : ''}
    </div>
  </div>
</section>`;
    }
    case 'stats': {
      const d = block.data as StatsBlockData;
      return `<section style="background:${isDark ? '#0e0e1a' : '#f4f4f8'};padding:40px 0">
  <div class="container">
    <div style="display:grid;grid-template-columns:repeat(${d.stats.length},1fr);text-align:center;gap:24px" class="grid-responsive">
      ${d.stats.map(st => `<div><div style="font-size:32px;font-weight:800;color:${s.primaryColor}">${st.value}</div><div style="font-size:13px;text-transform:uppercase;letter-spacing:0.08em;opacity:0.5">${st.label}</div></div>`).join('')}
    </div>
  </div>
</section>`;
    }
    case 'services': {
      const d = block.data as ServicesBlockData;
      return `<section style="padding:80px 0">
  <div class="container">
    <div style="text-align:center;margin-bottom:56px">
      <span class="section-eyebrow">${d.eyebrow}</span>
      <h2 class="section-title">${d.title}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px" class="grid-responsive">
      ${d.items.map(it => `<div class="card"><div style="font-size:28px;margin-bottom:16px">${it.icon}</div><h3 style="font-family:${s.fontHeading};font-size:18px;font-weight:700;margin-bottom:8px">${it.title}</h3><p style="color:${s.textColor}70;font-size:14px;line-height:1.7">${it.desc}</p></div>`).join('')}
    </div>
  </div>
</section>`;
    }
    case 'about': {
      const d = block.data as AboutBlockData;
      return `<section style="background:${isDark ? '#0e0e1a' : '#f0f0f5'};padding:80px 0">
  <div class="container" style="display:grid;grid-template-columns:1fr 1fr;gap:60px;align-items:center" class="grid-responsive">
    <div>
      <span class="section-eyebrow">${d.eyebrow}</span>
      <h2 class="section-title" style="text-align:left">${d.title}</h2>
      <p style="color:${s.textColor}80;font-size:16px;line-height:1.8;margin-bottom:24px">${d.text}</p>
      <button class="btn-primary">${d.ctaText} →</button>
    </div>
    <div style="aspect-ratio:1;background:linear-gradient(135deg,${s.primaryColor}15,${s.secondaryColor}30);border-radius:${s.borderRadius}px;overflow:hidden">
      ${d.image ? `<img src="${d.image}" style="width:100%;height:100%;object-fit:cover" alt="About">` : ''}
    </div>
  </div>
</section>`;
    }
    case 'testimonials': {
      const d = block.data as TestimonialsBlockData;
      return `<section style="padding:80px 0">
  <div class="container">
    <div style="text-align:center;margin-bottom:56px">
      <span class="section-eyebrow">${d.eyebrow}</span>
      <h2 class="section-title">${d.title}</h2>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px" class="grid-responsive">
      ${d.items.map(t => `<div class="card"><p style="color:${s.textColor}90;font-size:15px;line-height:1.7;font-style:italic;margin-bottom:16px">&ldquo;${t.text}&rdquo;</p><div><strong>${t.name}</strong><div style="color:${s.primaryColor};font-size:12px">${t.role}</div></div></div>`).join('')}
    </div>
  </div>
</section>`;
    }
    case 'cta-banner': {
      const d = block.data as CtaBannerBlockData;
      return `<section style="background:linear-gradient(135deg,${s.primaryColor}10 0%,${s.secondaryColor} 50%,${s.primaryColor}10 100%);padding:100px 0;text-align:center">
  <div class="container">
    <h2 class="section-title">${d.title}</h2>
    <p style="color:${s.textColor}70;max-width:500px;margin:0 auto 32px;font-size:16px">${d.subtitle}</p>
    <button class="btn-primary" style="font-size:16px;padding:16px 40px">${d.ctaText} →</button>
  </div>
</section>`;
    }
    case 'footer': {
      const d = block.data as FooterBlockData;
      return `<footer style="padding:40px 0;background:${isDark ? '#06060e' : '#f0f0f5'};border-top:1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}">
  <div class="container" style="text-align:center">
    <p style="font-size:13px;color:${s.textColor}40">${d.copyright}</p>
  </div>
</footer>`;
    }
    default:
      return '';
  }
}

// ── Export as downloadable ZIP ───────────────────────────────
export async function exportAsZip(state: EditorState): Promise<void> {
  const html = generateStaticHTML(state);
  const blob = new Blob([html], { type: 'text/html' });
  downloadBlob(blob, `${slugify(state.templateId)}-website.html`);
}

// ── Download blob helper ────────────────────────────────────
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// ═══════════════════════════════════════════════════════════════
// CLOUDFLARE PAGES DEPLOYMENT
// Uses Cloudflare Pages Direct Upload API
// ═══════════════════════════════════════════════════════════════

interface CloudflareConfig {
  apiToken: string;
  accountId: string;
}

let cfConfig: CloudflareConfig | null = null;

export function setCloudflareConfig(config: CloudflareConfig): void {
  cfConfig = config;
  // Persist to localStorage for reuse
  localStorage.setItem('webstudio_cf_config', JSON.stringify(config));
}

export function getCloudflareConfig(): CloudflareConfig | null {
  if (cfConfig) return cfConfig;
  const stored = localStorage.getItem('webstudio_cf_config');
  if (stored) {
    cfConfig = JSON.parse(stored);
    return cfConfig;
  }
  return null;
}

export function isCloudflareConfigured(): boolean {
  return !!getCloudflareConfig();
}

// ── Deploy to Cloudflare Pages ──────────────────────────────
export async function deployToCloudflare(
  state: EditorState,
  projectName: string,
  onProgress?: (status: DeployStatus, message: string) => void
): Promise<DeployResult> {
  const config = getCloudflareConfig();
  if (!config) {
    return { status: 'error', error: 'Cloudflare API not configured. Go to Settings to add your API token.' };
  }

  try {
    onProgress?.('building', 'Generating static site...');
    const html = generateStaticHTML(state);
    const slug = slugify(projectName);

    onProgress?.('uploading', 'Uploading to Cloudflare Pages...');

    // Step 1: Create or get project
    const projectRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/pages/projects`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: slug,
          production_branch: 'main',
        }),
      }
    );

    // Ignore "already exists" error
    const projectData = await projectRes.json();
    const actualSlug = projectData?.result?.name || slug;

    // Step 2: Create deployment
    onProgress?.('deploying', 'Creating deployment...');
    const formData = new FormData();
    formData.append('index.html', new Blob([html], { type: 'text/html' }), '/index.html');

    const deployRes = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/pages/projects/${actualSlug}/deployments`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${config.apiToken}`,
        },
        body: formData,
      }
    );

    const deployData = await deployRes.json();

    if (deployData.success) {
      const url = deployData.result?.url || `https://${actualSlug}.pages.dev`;
      onProgress?.('live', `Live at ${url}`);
      return { status: 'live', url, projectName: actualSlug, deployId: deployData.result?.id };
    } else {
      const errMsg = deployData.errors?.[0]?.message || 'Unknown deployment error';
      onProgress?.('error', errMsg);
      return { status: 'error', error: errMsg };
    }
  } catch (err: any) {
    const msg = err.message || 'Network error during deployment';
    onProgress?.('error', msg);
    return { status: 'error', error: msg };
  }
}
