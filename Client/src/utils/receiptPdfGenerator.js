import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Universal UTC-safe Date & Time parser for receipt
 */
const parseSafeDate = (dateStr) => {
  if (!dateStr) return null;
  let s = String(dateStr).trim();
  if (!s.endsWith('Z') && !/[+-]\d{2}:\d{2}$/.test(s)) {
    s += 'Z';
  }
  const date = new Date(s);
  return isNaN(date.getTime()) ? null : date;
};

const formatReceiptDateTime = (dateStr) => {
  const d = parseSafeDate(dateStr);
  if (!d) return 'N/A';
  return d.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

/**
 * Generates and downloads a clean, professional PDF Tax Invoice / Purchase Receipt
 * Also opens the PDF in a new tab for direct viewing and printing.
 */
export const generateOrderReceiptPdf = (order) => {
  if (!order) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const primaryColor = [20, 59, 47]; // #143B2F Emerald Green
  const darkTextColor = [30, 41, 59]; // #1E293B Slate 800
  const mutedTextColor = [100, 116, 139]; // #64748B Slate 500
  const lightBgColor = [248, 250, 248]; // #F8FAF8 Soft Green-Gray
  const accentGreen = [46, 125, 50]; // #2E7D32 Emerald

  // --- 1. Top Decorative Brand Bar ---
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 6, 'F');

  // --- 2. Header Brand Section ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text('FarmerBandh', 14, 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...mutedTextColor);
  doc.text('Direct Local Farm Produce Marketplace | India', 14, 25);
  doc.text('support@farmerbandh.com | www.farmerbandh.com', 14, 29);

  // --- Invoice Title & Order # on the right ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...darkTextColor);
  doc.text('TAX INVOICE / RECEIPT', pageWidth - 14, 19, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...accentGreen);
  doc.text(`Order #${order.orderNumber || 'FB-ORDER'}`, pageWidth - 14, 25, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  const formattedDate = formatReceiptDateTime(order.placedAt || order.createdAt);
  doc.text(`Date: ${formattedDate} (IST)`, pageWidth - 14, 30, { align: 'right' });
  doc.text(`Payment: ${order.paymentMethod || 'COD'} (${order.paymentStatus || 'Paid'})`, pageWidth - 14, 34, { align: 'right' });

  // Divider line
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.5);
  doc.line(14, 38, pageWidth - 14, 38);

  // --- 3. Billed By (Farmer Seller) & Shipped To (Buyer) Two Columns ---
  const colY = 44;
  const colWidth = (pageWidth - 36) / 2;

  // Box 1: Farmer Seller Details
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(14, colY, colWidth, 34, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, colY, colWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('FARMER SELLER (ORIGIN):', 18, colY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkTextColor);
  doc.text(order.sellerName || 'Verified Farm Partner', 18, colY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Location: ${order.sellerLocation || 'Gujarat, India'}`, 18, colY + 17);
  doc.text('FSSAI / Agriculture Mandi Verified Partner', 18, colY + 22);
  doc.text('Farm-fresh direct dispatch guaranteed', 18, colY + 27);

  // Box 2: Billed To / Shipping Destination
  const col2X = 14 + colWidth + 8;
  doc.setFillColor(...lightBgColor);
  doc.roundedRect(col2X, colY, colWidth, 34, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(col2X, colY, colWidth, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('BILLED & DELIVERED TO:', col2X + 4, colY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...darkTextColor);
  const buyerName = order.deliveryAddress?.label || order.recipientName || order.buyerName || 'Valued Customer';
  doc.text(buyerName, col2X + 4, colY + 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);
  const line1 = order.deliveryAddressLine || order.deliveryAddress?.line1 || 'Delivery Address on file';
  const cityState = `${order.deliveryCity || order.deliveryAddress?.city || 'Ahmedabad'}, ${order.deliveryState || order.deliveryAddress?.state || 'Gujarat'} - ${order.deliveryPincode || order.deliveryAddress?.pincode || '380001'}`;
  const phone = order.recipientPhone || order.deliveryAddress?.phone || '+91 9876543210';

  doc.text(line1, col2X + 4, colY + 17);
  doc.text(cityState, col2X + 4, colY + 22);
  doc.text(`Phone: ${phone}`, col2X + 4, colY + 27);

  // --- 4. Items Table (AutoTable) ---
  const tableData = (order.items || []).map((item, index) => {
    const qty = Number(item.quantityQuintal || 1);
    const unitPrice = Number(item.unitPricePerQuintal || item.unitPrice || 0);
    const lineTotal = Number(item.lineTotal || item.totalPrice || qty * unitPrice);

    return [
      (index + 1).toString(),
      item.productName || 'Agricultural Produce',
      `Grade ${item.grade || 'A'}`,
      `Rs. ${unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${qty} Qtl (${(qty * 100).toFixed(0)} kg)`,
      `Rs. ${lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ];
  });

  autoTable(doc, {
    startY: 84,
    head: [['#', 'Produce Item Description', 'Grade', 'Price / Quintal', 'Quantity', 'Amount (INR)']],
    body: tableData.length > 0 ? tableData : [
      ['1', 'Farm Fresh Produce', 'Grade A', `Rs. ${Number(order.subtotal || 0).toFixed(2)}`, '1 Qtl (100 kg)', `Rs. ${Number(order.subtotal || 0).toFixed(2)}`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'left'
    },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      textColor: darkTextColor,
      cellPadding: 3.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.3
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 60, fontStyle: 'bold' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 28, halign: 'center' },
      5: { cellWidth: 32, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: [252, 253, 252]
    }
  });

  // --- 5. Financial Summary Box below Table ---
  const finalY = doc.lastAutoTable.finalY + 6;
  const summaryX = pageWidth - 90;

  doc.setFillColor(...lightBgColor);
  doc.roundedRect(summaryX, finalY, 76, 46, 2, 2, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(summaryX, finalY, 76, 46, 2, 2, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkTextColor);

  let currentY = finalY + 6;
  const subtotal = Number(order.subtotal || 0);
  const deliveryFee = Number(order.deliveryFee || 0);
  const platformFee = Number(order.platformFee || 0);
  const taxAmount = Number(order.taxAmount || 0);
  const discountAmount = Number(order.discountAmount || 0);
  const grandTotal = Number(order.totalAmount || (subtotal + deliveryFee + platformFee + taxAmount - discountAmount));

  // Subtotal
  doc.text('Items Subtotal:', summaryX + 4, currentY);
  doc.text(`Rs. ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY, { align: 'right' });

  // Discount (if any)
  if (discountAmount > 0) {
    currentY += 5;
    doc.setTextColor(...accentGreen);
    doc.text(`Discount (${order.couponCode || 'Promo'}):`, summaryX + 4, currentY);
    doc.text(`-Rs. ${discountAmount.toFixed(2)}`, pageWidth - 18, currentY, { align: 'right' });
    doc.setTextColor(...darkTextColor);
  }

  // Delivery Fee
  currentY += 5;
  doc.text('Delivery & Transport:', summaryX + 4, currentY);
  doc.text(`Rs. ${deliveryFee.toFixed(2)}`, pageWidth - 18, currentY, { align: 'right' });

  // Platform Fee
  currentY += 5;
  doc.text('Platform Convenience:', summaryX + 4, currentY);
  doc.text(`Rs. ${platformFee.toFixed(2)}`, pageWidth - 18, currentY, { align: 'right' });

  // GST / Tax
  currentY += 5;
  doc.text('GST / Agriculture Cess:', summaryX + 4, currentY);
  doc.text(`Rs. ${taxAmount.toFixed(2)}`, pageWidth - 18, currentY, { align: 'right' });

  // Total divider
  currentY += 4;
  doc.setDrawColor(203, 213, 225);
  doc.line(summaryX + 4, currentY, pageWidth - 18, currentY);

  // Grand Total
  currentY += 6;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...primaryColor);
  doc.text('Total Paid:', summaryX + 4, currentY);
  doc.text(`Rs. ${grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, pageWidth - 18, currentY, { align: 'right' });

  // --- 6. Notes & Terms Section on Left of Summary ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...primaryColor);
  doc.text('TERMS & PAYMENT CONFIRMATION:', 14, finalY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text('1. Produce harvested & weighed according to standardized mandi grades.', 14, finalY + 12);
  doc.text('2. Delivered directly from verified farmer partner via local transport.', 14, finalY + 17);
  doc.text('3. Covered under FarmerBandh 48-Hour Return & Quality Dispute Policy.', 14, finalY + 22);
  doc.text('4. This is a computer-generated tax invoice. No signature is required.', 14, finalY + 27);

  // Verification Badge
  doc.setFillColor(232, 245, 233); // #E8F5E9
  doc.roundedRect(14, finalY + 32, 80, 8, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...accentGreen);
  doc.text(`[✓ VERIFIED] Status: ${order.status?.toUpperCase() || 'DELIVERED'} | Payment: ${order.paymentStatus?.toUpperCase() || 'PAID'}`, 17, finalY + 37.5);

  // --- 7. Footer Decorative Line & Text ---
  const footerY = 282;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, footerY, pageWidth - 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('FarmerBandh Technologies Pvt. Ltd. | Empowering Farmers & Buyers Across India', 14, footerY + 5);
  doc.text(`Generated on ${new Date().toLocaleDateString('en-IN')} | Page 1 of 1`, pageWidth - 14, footerY + 5, { align: 'right' });

  // --- 8. Save/Download File AND Open in New Tab for Browser PDF Reader ---
  const fileName = `FarmerBandh_Receipt_${order.orderNumber || 'FB'}.pdf`;

  // 1. Download the PDF file directly
  doc.save(fileName);

  // 2. Open in new window / tab so user can immediately view/print in browser PDF reader
  try {
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);
    window.open(blobUrl, '_blank');
  } catch {
    // If popups blocked, download is already completed
  }

  return fileName;
};
