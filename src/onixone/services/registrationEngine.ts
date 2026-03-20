/**
 * 📋 Registration Engine — WCCCS Publishing Engine
 *
 * ISBN management, barcode generation, CIP data, and legal page automation.
 * - ISBN-10/13 validation and formatting
 * - EAN-13 barcode rendering (SVG)
 * - Cataloguing-in-Publication data blocks
 * - ISSN for periodicals
 * - Legal page generation
 */

// ═══════════════════════════════════════════════════════════════════════════════
// 📐 ISBN MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export interface ISBNRecord {
  isbn13: string;
  isbn10?: string;
  title: string;
  format: 'paperback' | 'hardcover' | 'ebook';
  assignedDate: string;
  status: 'assigned' | 'in-use' | 'retired';
}

/**
 * Validate an ISBN-13 check digit.
 */
export function validateISBN13(isbn: string): boolean {
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length !== 13 || !/^\d{13}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(clean[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(clean[12]);
}

/**
 * Validate an ISBN-10 check digit.
 */
export function validateISBN10(isbn: string): boolean {
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length !== 10) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    if (!/\d/.test(clean[i])) return false;
    sum += parseInt(clean[i]) * (10 - i);
  }
  const lastChar = clean[9].toUpperCase();
  const lastValue = lastChar === 'X' ? 10 : parseInt(lastChar);
  if (isNaN(lastValue)) return false;
  sum += lastValue;

  return sum % 11 === 0;
}

/**
 * Convert ISBN-10 to ISBN-13.
 */
export function isbn10to13(isbn10: string): string {
  const clean = isbn10.replace(/[-\s]/g, '');
  if (clean.length !== 10) throw new Error('Invalid ISBN-10');

  const prefix = '978' + clean.substring(0, 9);
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(prefix[i]) * (i % 2 === 0 ? 1 : 3);
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return prefix + checkDigit;
}

/**
 * Format ISBN-13 with hyphens (simplified; real formatting depends on registration group).
 */
export function formatISBN13(isbn: string): string {
  const clean = isbn.replace(/[-\s]/g, '');
  if (clean.length !== 13) return isbn;

  // Standard formatting: 978-X-XXXX-XXXX-X
  return `${clean.slice(0, 3)}-${clean.slice(3, 4)}-${clean.slice(4, 8)}-${clean.slice(8, 12)}-${clean.slice(12)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 EAN-13 BARCODE GENERATION (SVG)
// ═══════════════════════════════════════════════════════════════════════════════

// EAN-13 encoding tables
const L_PATTERNS = [
  '0001101', '0011001', '0010011', '0111101', '0100011',
  '0110001', '0101111', '0111011', '0110111', '0001011',
];

const R_PATTERNS = [
  '1110010', '1100110', '1101100', '1000010', '1011100',
  '1001110', '1010000', '1000100', '1001000', '1110100',
];

const PARITY_PATTERNS = [
  'LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG',
  'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL',
];

const G_PATTERNS = [
  '0100111', '0110011', '0011011', '0100001', '0011101',
  '0111001', '0000101', '0010001', '0001001', '0010111',
];

/**
 * Generate an EAN-13 barcode as SVG string from an ISBN-13.
 */
export function generateBarcodeSVG(isbn13: string, width: number = 200, height: number = 80): string {
  const clean = isbn13.replace(/[-\s]/g, '');
  if (clean.length !== 13 || !validateISBN13(clean)) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><text x="10" y="40" fill="red" font-size="12">Invalid ISBN</text></svg>`;
  }

  const digits = clean.split('').map(Number);
  const parityPattern = PARITY_PATTERNS[digits[0]];

  // Build binary string
  let binary = '101'; // Start guard

  // Left side (digits 1-6)
  for (let i = 0; i < 6; i++) {
    const digit = digits[i + 1];
    if (parityPattern[i] === 'L') {
      binary += L_PATTERNS[digit];
    } else {
      binary += G_PATTERNS[digit];
    }
  }

  binary += '01010'; // Center guard

  // Right side (digits 7-12)
  for (let i = 0; i < 6; i++) {
    binary += R_PATTERNS[digits[i + 7]];
  }

  binary += '101'; // End guard

  // Generate SVG
  const barWidth = width / (binary.length + 14); // Extra space for number labels
  const barAreaWidth = binary.length * barWidth;
  const xOffset = (width - barAreaWidth) / 2;
  const textY = height - 4;
  const barHeight = height - 18;

  let bars = '';
  for (let i = 0; i < binary.length; i++) {
    if (binary[i] === '1') {
      const x = xOffset + i * barWidth;
      // Guard bars are taller
      const isGuard = i < 3 || i >= binary.length - 3 || (i >= 45 && i <= 49);
      const bh = isGuard ? barHeight + 6 : barHeight;
      bars += `<rect x="${x.toFixed(2)}" y="2" width="${barWidth.toFixed(2)}" height="${bh}" fill="black"/>`;
    }
  }

  // Number labels
  const formatted = formatISBN13(clean);
  const labelFontSize = Math.max(8, height * 0.12);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="white"/>
  ${bars}
  <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="monospace" font-size="${labelFontSize}" fill="black">${formatted}</text>
</svg>`;
}

/**
 * Generate barcode as a data URL for embedding.
 */
export function generateBarcodeDataURL(isbn13: string, width?: number, height?: number): string {
  const svg = generateBarcodeSVG(isbn13, width, height);
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📝 CIP DATA (Cataloguing-in-Publication)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CIPData {
  title: string;
  authors: string[];
  publisher: string;
  isbn: string;
  subjectHeadings: string[];
  deweyDecimal?: string;
  lcClassification?: string;
  publicationYear: string;
}

/**
 * Generate a CIP data block for the copyright page.
 * This is a simplified version — real CIP comes from the Library of Congress.
 */
export function generateCIPBlock(data: CIPData): string {
  const lines: string[] = [];
  lines.push('Library of Congress Cataloging-in-Publication Data');
  lines.push('');
  lines.push(`Names: ${data.authors.join(', ')}, author${data.authors.length > 1 ? 's' : ''}.`);
  lines.push(`Title: ${data.title} / ${data.authors.join(', ')}.`);
  lines.push(`Description: First edition. | ${data.publisher}, ${data.publicationYear}.`);
  lines.push(`Identifiers: ISBN ${formatISBN13(data.isbn)}`);

  if (data.subjectHeadings.length > 0) {
    lines.push(`Subjects: ${data.subjectHeadings.join(' | ')}`);
  }
  if (data.deweyDecimal) {
    lines.push(`Classification: DDC ${data.deweyDecimal}`);
  }
  if (data.lcClassification) {
    lines.push(`Classification: LCC ${data.lcClassification}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📄 LEGAL PAGE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface LegalPageConfig {
  title: string;
  authors: string[];
  publisher: string;
  isbn?: string;
  copyrightYear: string;
  country: string;
  edition: string;
  includeRightsStatement: boolean;
  includeDisclaimers: boolean;
  includePrintingInfo: boolean;
  customDisclaimers?: string[];
}

/**
 * Generate complete copyright/legal page text.
 */
export function generateLegalPageText(config: LegalPageConfig): string {
  const lines: string[] = [];

  // Copyright notice
  lines.push(`© ${config.copyrightYear} ${config.authors[0] || config.publisher}`);
  lines.push('');

  // Rights statement
  if (config.includeRightsStatement) {
    lines.push('All rights reserved. No part of this publication may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the publisher, except in the case of brief quotations embodied in critical reviews and certain other noncommercial uses permitted by copyright law.');
    lines.push('');
  }

  // Publisher info
  lines.push(`Published by ${config.publisher}`);
  lines.push('');

  // ISBN
  if (config.isbn) {
    lines.push(`ISBN: ${formatISBN13(config.isbn)}`);
    lines.push('');
  }

  // Disclaimers
  if (config.includeDisclaimers) {
    lines.push('This is a work of fiction. Names, characters, business, events, and incidents are the products of the author\'s imagination. Any resemblance to actual persons, living or dead, or actual events is purely coincidental.');
    lines.push('');
  }

  // Custom disclaimers
  if (config.customDisclaimers) {
    for (const disclaimer of config.customDisclaimers) {
      lines.push(disclaimer);
      lines.push('');
    }
  }

  // Printing info
  if (config.includePrintingInfo) {
    lines.push(`Printed in ${config.country}`);
    lines.push(`${config.edition}`);
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// 📊 ISSN (International Standard Serial Number)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate ISSN check digit.
 */
export function validateISSN(issn: string): boolean {
  const clean = issn.replace(/[-\s]/g, '');
  if (clean.length !== 8) return false;

  let sum = 0;
  for (let i = 0; i < 7; i++) {
    if (!/\d/.test(clean[i])) return false;
    sum += parseInt(clean[i]) * (8 - i);
  }
  const remainder = sum % 11;
  const checkDigit = remainder === 0 ? '0' : remainder === 1 ? 'X' : String(11 - remainder);
  return clean[7].toUpperCase() === checkDigit;
}

/**
 * Format ISSN with hyphen.
 */
export function formatISSN(issn: string): string {
  const clean = issn.replace(/[-\s]/g, '');
  if (clean.length !== 8) return issn;
  return `${clean.slice(0, 4)}-${clean.slice(4)}`;
}
