import PptxGenJS from 'pptxgenjs';
import { BRAND_SYSTEM } from '../templates/brand-system';

/**
 * Generates a branded PowerPoint presentation from AI content.
 * Returns the presentation as a Base64 string for download or Graph API upload.
 */
export async function generateBrandedPresentation(title: string, slidesContent: Array<{ heading: string; body: string; imagePath?: string }>): Promise<string> {
  const pptx = new PptxGenJS();

  // Set presentation properties
  pptx.author = BRAND_SYSTEM.company.name;
  pptx.company = BRAND_SYSTEM.company.name;
  pptx.subject = title;
  pptx.title = title;

  // Define master slide layout (branded footer, etc.)
  pptx.defineSlideMaster({
    title: 'MASTER_SLIDE',
    background: { color: BRAND_SYSTEM.colors.white.replace('#', '') },
    objects: [
      { rect: { x: 0, y: '90%', w: '100%', h: '10%', fill: { color: BRAND_SYSTEM.colors.primary.replace('#', '') } } },
      { text: { text: BRAND_SYSTEM.company.name.toUpperCase(), options: { x: 0.5, y: '93%', w: 3, h: 0.3, color: BRAND_SYSTEM.colors.accent.replace('#', ''), fontSize: 10, bold: true } } },
      { text: { text: 'CONFIDENTIAL', options: { x: 8.5, y: '93%', w: 1.5, h: 0.3, color: BRAND_SYSTEM.colors.white.replace('#', ''), fontSize: 10, align: 'right' } } }
    ]
  });

  // 1. Title Slide
  const titleSlide = pptx.addSlide();
  // We use a dark background for the title slide for premium feel
  titleSlide.background = { color: BRAND_SYSTEM.colors.primary.replace('#', '') };
  
  // Decorative gold accent line
  titleSlide.addShape(pptx.ShapeType.rect, {
    x: 1, y: 2, w: 0.1, h: 2, fill: { color: BRAND_SYSTEM.colors.accent.replace('#', '') }
  });

  titleSlide.addText(title, {
    x: 1.5, y: 2, w: 7, h: 1.5,
    fontSize: 44,
    bold: true,
    color: BRAND_SYSTEM.colors.white.replace('#', ''),
    fontFace: 'Georgia'
  });

  titleSlide.addText(BRAND_SYSTEM.company.name, {
    x: 1.5, y: 3.5, w: 7, h: 0.5,
    fontSize: 16,
    color: BRAND_SYSTEM.colors.accent.replace('#', ''),
    bold: true,
    fontFace: 'Arial'
  });

  // 2. Content Slides
  for (const content of slidesContent) {
    const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

    // Header
    slide.addText(content.heading, {
      x: 0.5, y: 0.5, w: 9, h: 0.8,
      fontSize: 28,
      bold: true,
      color: BRAND_SYSTEM.colors.primary.replace('#', ''),
      fontFace: 'Georgia'
    });

    // Add border line
    slide.addShape(pptx.ShapeType.line, {
      x: 0.5, y: 1.3, w: 9, h: 0,
      line: { color: BRAND_SYSTEM.colors.accent.replace('#', ''), width: 2 }
    });

    // If an image is present, adjust text width and add image
    const hasImage = !!content.imagePath;
    const textWidth = hasImage ? 4.5 : 8.5;

    if (hasImage) {
      slide.addImage({
        path: content.imagePath!,
        x: 5.5,
        y: 1.8,
        w: 4.0,
        h: 3.0,
        sizing: { type: 'contain' }
      });
    }

    // Parse simple markdown-like body
    const lines = content.body.split('\n').filter(l => l.trim().length > 0);
    const bullets: any[] = [];
    
    let yPos = 1.8;
    for (const line of lines) {
      if (line.startsWith('- ') || line.startsWith('* ')) {
        // Bullet point
        slide.addText(line.substring(2), {
          x: 0.8, y: yPos, w: textWidth, h: 0.4,
          fontSize: 14,
          color: BRAND_SYSTEM.colors.text.replace('#', ''),
          bullet: { type: 'number' },
          fontFace: 'Arial'
        });
        yPos += 0.5;
      } else {
        // Regular paragraph
        slide.addText(line, {
          x: 0.5, y: yPos, w: textWidth, h: 0.4,
          fontSize: 14,
          color: BRAND_SYSTEM.colors.textMuted.replace('#', ''),
          fontFace: 'Arial'
        });
        yPos += 0.6;
      }
    }
  }

  // Generate Base64
  const base64Data = await pptx.write({ outputType: 'base64' });
  return base64Data as string;
}
