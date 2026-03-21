// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Import Engine
// Parse any HTML file into EditorBlocks (Vibe-Code Import)
// ═══════════════════════════════════════════════════════════════

import type { EditorBlock, EditorState, SiteSettings, BlockType } from './editorEngine';
import { createBlock, createDefaultBlockData } from './editorEngine';
import type {
  NavBlockData, HeroBlockData, ServicesBlockData, AboutBlockData,
  TestimonialsBlockData, ContactBlockData, FooterBlockData, CustomHtmlBlockData,
} from './editorEngine';

// ── Parse HTML string into EditorState ──────────────────────
export function importHTMLToEditorState(html: string, siteName?: string): EditorState {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const blocks: EditorBlock[] = [];
  let order = 0;

  // Extract global styles
  const settings = extractSettingsFromDocument(doc);

  // Detect nav
  const nav = doc.querySelector('nav, header, [role="navigation"]');
  if (nav) {
    const navBlock = createBlock('nav', order++);
    const d = navBlock.data as NavBlockData;
    d.siteName = siteName || extractTextContent(nav.querySelector('.logo, .brand, .navbar-brand, [class*="logo"]')) || 'Imported Site';
    d.links = Array.from(nav.querySelectorAll('a')).slice(0, 6).map(a => a.textContent?.trim() || '');
    d.ctaText = extractTextContent(nav.querySelector('button, .btn, [class*="cta"]')) || 'Contact Us';
    blocks.push(navBlock);
  }

  // Detect hero section
  const hero = doc.querySelector('[class*="hero"], [class*="banner"], section:first-of-type, .jumbotron');
  if (hero) {
    const heroBlock = createBlock('hero', order++);
    const d = heroBlock.data as HeroBlockData;
    d.title = extractTextContent(hero.querySelector('h1')) || extractTextContent(hero.querySelector('h2')) || 'Welcome';
    d.subtitle = extractTextContent(hero.querySelector('p')) || '';
    d.ctaText = extractTextContent(hero.querySelector('button, .btn, a[class*="btn"]')) || 'Get Started';
    const bgImg = extractBackgroundImage(hero) || hero.querySelector('img')?.getAttribute('src') || '';
    d.backgroundImage = bgImg;
    blocks.push(heroBlock);
  }

  // Detect all remaining sections
  const sections = doc.querySelectorAll('section, [class*="section"], main > div');
  sections.forEach((section, i) => {
    if (section === hero) return; // Skip hero

    const sectionType = detectSectionType(section);
    const block = createBlock(sectionType, order++);

    // Fill block data based on detected type
    populateBlockFromSection(block, section, sectionType);
    blocks.push(block);
  });

  // Detect footer
  const footer = doc.querySelector('footer');
  if (footer) {
    const footerBlock = createBlock('footer', order++);
    const d = footerBlock.data as FooterBlockData;
    d.copyright = extractTextContent(footer.querySelector('[class*="copy"], [class*="bottom"], small, p:last-child')) || `© 2026 ${siteName || 'Imported Site'}`;
    blocks.push(footerBlock);
  }

  // If no blocks detected, create a custom HTML block with the entire body
  if (blocks.length === 0) {
    const customBlock = createBlock('custom-html', 0);
    (customBlock.data as CustomHtmlBlockData).html = doc.body.innerHTML;
    blocks.push(customBlock);
  }

  return {
    siteId: 'imported_' + Date.now().toString(36),
    templateId: 'custom-import',
    blocks,
    settings,
    media: [],
    isDirty: true,
    lastSaved: null,
  };
}

// ── Detect section type from DOM content ────────────────────
function detectSectionType(el: Element): BlockType {
  const text = (el.textContent || '').toLowerCase();
  const className = (el.className || '').toLowerCase();
  const innerHTML = el.innerHTML.toLowerCase();

  // Check class names
  if (className.match(/service|feature|offer/)) return 'services';
  if (className.match(/about|story|mission/)) return 'about';
  if (className.match(/testimonial|review|quote/)) return 'testimonials';
  if (className.match(/pricing|plan|package/)) return 'pricing';
  if (className.match(/gallery|portfolio|work/)) return 'gallery';
  if (className.match(/faq|question|accordion/)) return 'faq';
  if (className.match(/contact|touch|reach/)) return 'contact';
  if (className.match(/cta|call-to-action|action/)) return 'cta-banner';
  if (className.match(/stat|counter|number|metric/)) return 'stats';
  if (className.match(/logo|partner|client|brand/)) return 'logos';

  // Check content
  if (text.match(/our services|what we offer|features/)) return 'services';
  if (text.match(/about us|our story|who we are/)) return 'about';
  if (text.match(/testimonial|what .* say|review/)) return 'testimonials';
  if (text.match(/pricing|plans|packages|month/)) return 'pricing';
  if (text.match(/gallery|portfolio|our work/)) return 'gallery';
  if (text.match(/faq|frequently asked|questions/)) return 'faq';
  if (text.match(/contact|get in touch|reach out/)) return 'contact';
  if (text.match(/get started|ready to|join us/)) return 'cta-banner';

  // Check for image grids (gallery)
  const images = el.querySelectorAll('img');
  if (images.length >= 4) return 'gallery';

  // Check for cards (services)
  const cards = el.querySelectorAll('[class*="card"], [class*="item"], [class*="col"]');
  if (cards.length >= 3) return 'services';

  // Default: custom HTML
  return 'custom-html';
}

// ── Populate block data from section DOM ────────────────────
function populateBlockFromSection(block: EditorBlock, section: Element, type: BlockType): void {
  switch (type) {
    case 'services': {
      const d = block.data as ServicesBlockData;
      d.title = extractTextContent(section.querySelector('h2, h3')) || 'Our Services';
      const cards = section.querySelectorAll('[class*="card"], [class*="item"], [class*="col"] > div, li');
      if (cards.length > 0) {
        d.items = Array.from(cards).slice(0, 6).map(card => ({
          title: extractTextContent(card.querySelector('h3, h4, strong')) || 'Service',
          desc: extractTextContent(card.querySelector('p')) || '',
          icon: '⚡',
        }));
      }
      break;
    }
    case 'about': {
      const d = block.data as AboutBlockData;
      d.title = extractTextContent(section.querySelector('h2, h3')) || 'About Us';
      d.text = extractTextContent(section.querySelector('p')) || '';
      d.image = section.querySelector('img')?.getAttribute('src') || '';
      break;
    }
    case 'contact': {
      const d = block.data as ContactBlockData;
      d.title = extractTextContent(section.querySelector('h2, h3')) || 'Contact Us';
      break;
    }
    case 'custom-html': {
      (block.data as CustomHtmlBlockData).html = section.outerHTML;
      break;
    }
  }
}

// ── Extract settings from document ──────────────────────────
function extractSettingsFromDocument(doc: Document): SiteSettings {
  const body = doc.body;
  const computed = body ? {
    bg: body.style.backgroundColor || body.style.background || '',
    color: body.style.color || '',
    font: body.style.fontFamily || '',
  } : { bg: '', color: '', font: '' };

  // Try to detect from stylesheets
  const styles = doc.querySelectorAll('style');
  let primaryColor = '#D4AF37';
  styles.forEach(style => {
    const text = style.textContent || '';
    // Look for common primary color patterns
    const colorMatch = text.match(/(?:primary|accent|brand|--primary).*?:\s*([#][0-9a-fA-F]{3,8})/);
    if (colorMatch) primaryColor = colorMatch[1];
  });

  const isDark = computed.bg.includes('#0') || computed.bg.includes('rgb(0') || computed.bg.includes('dark');

  return {
    primaryColor,
    secondaryColor: isDark ? '#1a1a2e' : '#f0f0f5',
    bgColor: isDark ? '#0a0a14' : '#fafafa',
    textColor: isDark ? '#e2e8f0' : '#1a1a2e',
    fontHeading: computed.font || "'Inter', sans-serif",
    fontBody: "'Inter', sans-serif",
    borderRadius: 12,
    layoutTheme: 'classic',
    editMode: 'grid',
  };
}

// ── Helpers ─────────────────────────────────────────────────
function extractTextContent(el: Element | null): string {
  if (!el) return '';
  return el.textContent?.trim().slice(0, 200) || '';
}

function extractBackgroundImage(el: Element): string {
  const style = el.getAttribute('style') || '';
  const match = style.match(/url\(['"]?([^'"()]+)['"]?\)/);
  return match?.[1] || '';
}

// ── File drop handler (for drag-and-drop .html import) ──────
export function handleHTMLFileDrop(
  file: File,
  callback: (state: EditorState) => void
): void {
  const reader = new FileReader();
  reader.onload = () => {
    const html = reader.result as string;
    const name = file.name.replace(/\.html?$/, '').replace(/[-_]/g, ' ');
    const state = importHTMLToEditorState(html, name);
    callback(state);
  };
  reader.readAsText(file);
}
