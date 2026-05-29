// src/lib/tearSheetExporter.js
// Generates a downloadable PDF Tear Sheet without any print dialog
// Uses html2canvas to capture a dedicated hidden render,
// then embeds it into jsPDF as a properly formatted A4 document
// Zero browser print API involvement

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * exportTearSheet
 * Captures the tear sheet DOM element and saves as PDF download.
 * No print dialog. No window.print(). Pure client-side download.
 *
 * @param {string} elementId  - ID of the DOM element to capture
 * @param {string} filename   - Output filename without extension
 * @param {Function} onStart  - Called when export begins (show loading)
 * @param {Function} onDone   - Called when PDF is saved (hide loading)
 * @param {Function} onError  - Called on failure with error message
 */
export async function exportTearSheet(
  elementId = 'tear-sheet-render',
  filename  = 'AlphaShield_TearSheet',
  onStart   = () => {},
  onDone    = () => {},
  onError   = () => {}
) {
  onStart();

  const element = document.getElementById(elementId);
  if (!element) {
    onError('Tear Sheet element tidak ditemukan di DOM.');
    return;
  }

  try {
    // Make element temporarily visible for capture
    const prevDisplay  = element.style.display;
    const prevPosition = element.style.position;
    element.style.display  = 'block';
    element.style.position = 'fixed';
    element.style.top      = '-9999px';
    element.style.left     = '0';
    element.style.zIndex   = '-1';

    await new Promise(resolve => setTimeout(resolve, 100)); // allow render

    const canvas = await html2canvas(element, {
      backgroundColor: '#000000',
      scale:           2,          // 2x for retina quality
      useCORS:         true,
      logging:         false,
      windowWidth:     794,        // A4 width in px at 96dpi
      windowHeight:    1123,       // A4 height in px at 96dpi
    });

    // Restore element
    element.style.display  = prevDisplay;
    element.style.position = prevPosition;
    element.style.top      = '';
    element.style.left     = '';
    element.style.zIndex   = '';

    // Build PDF — A4 landscape for better dashboard fit
    const pdf    = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pdfW   = pdf.internal.pageSize.getWidth();
    const pdfH   = pdf.internal.pageSize.getHeight();

    const imgW   = canvas.width;
    const imgH   = canvas.height;
    const ratio  = Math.min(pdfW / imgW, pdfH / imgH);
    const imgX   = (pdfW - imgW * ratio) / 2;
    const imgY   = 0;

    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', imgX, imgY, imgW * ratio, imgH * ratio);

    // If content overflows one page, add pages
    if (imgH * ratio > pdfH) {
      let heightLeft = imgH * ratio - pdfH;
      let position   = -pdfH;
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', imgX, position, imgW * ratio, imgH * ratio);
        heightLeft -= pdfH;
        position   -= pdfH;
      }
    }

    // Generate timestamp for filename
    const now   = new Date();
    const stamp = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
    pdf.save(`${filename}_${stamp}.pdf`);

    onDone();
  } catch (err) {
    console.error('[TearSheet] Export failed:', err);
    onError(err.message ?? 'Export gagal. Coba lagi.');
  }
}
