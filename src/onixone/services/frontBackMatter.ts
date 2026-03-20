/**
 * 📖 Front/Back Matter Generator — WCCCS Publishing Engine
 *
 * Auto-generates professional front and back matter for books:
 * - Half-title page
 * - Title page (with publisher/imprint)
 * - Copyright page (©, ISBN, CIP, rights)
 * - Dedication / Acknowledgements
 * - About the Author
 * - Also By page
 * - Colophon
 */

import { StoryBlock, TextStoryBlock, BookMetadata } from '../types';

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface FrontMatterConfig {
  includeHalfTitle: boolean;
  includeTitlePage: boolean;
  includeCopyrightPage: boolean;
  includeDedication: boolean;
  dedicationText?: string;
  includeAcknowledgements: boolean;
  acknowledgementsText?: string;
  includeForeword: boolean;
  forewordText?: string;
  forewordAuthor?: string;
}

export interface BackMatterConfig {
  includeAboutAuthor: boolean;
  aboutAuthorText?: string;
  aboutAuthorPhoto?: string;
  includeAlsoBy: boolean;
  alsoByTitles?: string[];
  includeColophon: boolean;
  colophonText?: string;
  includeIndex: boolean;
}

export const DEFAULT_FRONT_MATTER: FrontMatterConfig = {
  includeHalfTitle: true,
  includeTitlePage: true,
  includeCopyrightPage: true,
  includeDedication: false,
  includeAcknowledgements: false,
  includeForeword: false,
};

export const DEFAULT_BACK_MATTER: BackMatterConfig = {
  includeAboutAuthor: true,
  includeAlsoBy: false,
  includeColophon: false,
  includeIndex: false,
};

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 FRONT MATTER GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate front matter story blocks that precede the main content.
 * These blocks are composed by the Composition Engine like any other content.
 */
export function generateFrontMatter(
  metadata: BookMetadata,
  config: FrontMatterConfig = DEFAULT_FRONT_MATTER,
): StoryBlock[] {
  const blocks: StoryBlock[] = [];
  const publisher = metadata.publisher || 'WCCCS Publishing';
  const year = metadata.copyrightYear || new Date().getFullYear().toString();

  // Half-title page (just the title, centred)
  if (config.includeHalfTitle) {
    blocks.push(
      createBlock('fm-halftitle', 'chapter', metadata.title),
      createBlock('fm-halftitle-break', 'break', '', 'page'),
    );
  }

  // Title page (title, subtitle, author, publisher)
  if (config.includeTitlePage) {
    blocks.push(
      createBlock('fm-title', 'chapter', metadata.title),
    );
    if (metadata.subtitle) {
      blocks.push(createBlock('fm-subtitle', 'heading', metadata.subtitle));
    }
    if (metadata.authors && metadata.authors.length > 0) {
      blocks.push(createBlock('fm-author', 'heading', `by ${metadata.authors.join(' & ')}`));
    }
    blocks.push(
      createBlock('fm-publisher', 'paragraph', publisher),
      createBlock('fm-title-break', 'break', '', 'page'),
    );
  }

  // Copyright page
  if (config.includeCopyrightPage) {
    const copyrightLines: string[] = [];
    copyrightLines.push(`© ${year} ${metadata.authors?.[0] || publisher}. All rights reserved.`);
    copyrightLines.push('');
    copyrightLines.push(`Published by ${publisher}`);
    if (metadata.imprint) {
      copyrightLines.push(`An imprint of ${metadata.imprint}`);
    }
    copyrightLines.push('');
    if (metadata.isbn) {
      copyrightLines.push(`ISBN: ${metadata.isbn}`);
    }
    copyrightLines.push('');
    copyrightLines.push('No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.');
    copyrightLines.push('');
    copyrightLines.push(`Printed in the Republic of South Africa`);
    copyrightLines.push(`First Edition, ${year}`);

    blocks.push(
      createBlock('fm-copyright', 'paragraph', copyrightLines.join('\n')),
      createBlock('fm-copyright-break', 'break', '', 'page'),
    );
  }

  // Dedication
  if (config.includeDedication && config.dedicationText) {
    blocks.push(
      createBlock('fm-dedication', 'quote', config.dedicationText),
      createBlock('fm-dedication-break', 'break', '', 'page'),
    );
  }

  // Acknowledgements
  if (config.includeAcknowledgements && config.acknowledgementsText) {
    blocks.push(
      createBlock('fm-ack-title', 'chapter', 'Acknowledgements'),
      createBlock('fm-ack-text', 'paragraph', config.acknowledgementsText),
      createBlock('fm-ack-break', 'break', '', 'page'),
    );
  }

  // Foreword
  if (config.includeForeword && config.forewordText) {
    blocks.push(
      createBlock('fm-foreword-title', 'chapter', 'Foreword'),
      createBlock('fm-foreword-text', 'paragraph', config.forewordText),
    );
    if (config.forewordAuthor) {
      blocks.push(createBlock('fm-foreword-author', 'paragraph', `— ${config.forewordAuthor}`));
    }
    blocks.push(createBlock('fm-foreword-break', 'break', '', 'page'));
  }

  return blocks;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 BACK MATTER GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate back matter story blocks that follow the main content.
 */
export function generateBackMatter(
  metadata: BookMetadata,
  config: BackMatterConfig = DEFAULT_BACK_MATTER,
): StoryBlock[] {
  const blocks: StoryBlock[] = [];

  // About the Author
  if (config.includeAboutAuthor) {
    blocks.push(
      createBlock('bm-about-title', 'chapter', 'About the Author'),
    );
    if (config.aboutAuthorText) {
      blocks.push(createBlock('bm-about-text', 'paragraph', config.aboutAuthorText));
    } else if (metadata.authors && metadata.authors.length > 0) {
      blocks.push(createBlock('bm-about-text', 'paragraph',
        `${metadata.authors[0]} is the author of "${metadata.title}." For more information, visit the publisher's website.`
      ));
    }
    blocks.push(createBlock('bm-about-break', 'break', '', 'page'));
  }

  // Also By
  if (config.includeAlsoBy && config.alsoByTitles && config.alsoByTitles.length > 0) {
    blocks.push(
      createBlock('bm-alsoby-title', 'chapter', `Also by ${metadata.authors?.[0] || 'the Author'}`),
    );
    for (const [idx, title] of config.alsoByTitles.entries()) {
      blocks.push(createBlock(`bm-alsoby-${idx}`, 'paragraph', title));
    }
    blocks.push(createBlock('bm-alsoby-break', 'break', '', 'page'));
  }

  // Colophon
  if (config.includeColophon) {
    const colophonText = config.colophonText ||
      `This book was typeset using the WCCCS Publishing Engine. ` +
      `Body text is set in EB Garamond. Headings are set in Playfair Display. ` +
      `Printed and bound by WCCCS Publishing.`;

    blocks.push(
      createBlock('bm-colophon-title', 'chapter', 'Colophon'),
      createBlock('bm-colophon-text', 'paragraph', colophonText),
    );
  }

  return blocks;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 🔧 HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function createBlock(
  id: string,
  type: 'chapter' | 'heading' | 'paragraph' | 'quote' | 'note' | 'break',
  text: string,
  breakType?: 'page' | 'column',
): StoryBlock {
  if (type === 'break') {
    return {
      id,
      type: 'break',
      breakType: breakType || 'page',
    } as any;
  }
  return {
    id,
    type,
    text,
  } as TextStoryBlock;
}
