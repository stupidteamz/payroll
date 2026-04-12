const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Thai font paths (Prioritize bundled fonts for Render/Linux compatibility)
const FONT_REGULAR = path.join(__dirname, '..', 'fonts', 'Kanit-Regular.ttf');
const FONT_BOLD = path.join(__dirname, '..', 'fonts', 'Kanit-Bold.ttf');

// Fallback for local Windows development
const WINDOWS_FONT_REGULAR = 'C:\\Windows\\Fonts\\tahoma.ttf';
const WINDOWS_FONT_BOLD = 'C:\\Windows\\Fonts\\tahomabd.ttf';

const getFont = (type = 'regular') => {
    const localFont = type === 'bold' ? FONT_BOLD : FONT_REGULAR;
    const winFont = type === 'bold' ? WINDOWS_FONT_BOLD : WINDOWS_FONT_REGULAR;
    
    if (fs.existsSync(localFont)) return localFont;
    if (fs.existsSync(winFont)) return winFont;
    return null; // Fallback to default PDF font (will break Thai)
};

exports.createPayslipPDF = (payslipData, stream) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        doc.pipe(stream);

        const fontBold = getFont('bold');
        const fontRegular = getFont('regular');

        // Header
        if (fontBold) doc.font(fontBold);
        doc.fillColor('#10b981').fontSize(22).text('ใบแจ้งยอดเงินเดือน (Payslip)', { align: 'center' });
        doc.fillColor('#334155').fontSize(16).text('ดาวรุ่ง ทราเวล (Dawrung Travel)', { align: 'center' });
        doc.moveDown();

        // Employee Info Box
        const infoY = doc.y;
        doc.rect(50, infoY, 500, 80).fill('#f8fafc').stroke('#e2e8f0');
        doc.fillColor('#1e293b');
        
        if (fontRegular) doc.font(fontRegular);
        doc.fontSize(11);
        doc.text(`ชื่อพนักงาน: ${payslipData.thaiName}`, 70, infoY + 15);
        doc.text(`ตำแหน่ง: ${payslipData.position || '-'}`, 70, infoY + 35);
        doc.text(`เลขบัญชี: ${payslipData.bankAccountNumber || '-'} (${payslipData.bankName || 'กสิกรไทย'})`, 70, infoY + 55);
        
        doc.text(`รหัสพนักงาน: ${payslipData.employeeId}`, 350, infoY + 15);
        doc.text(`ประจำเดือน: ${payslipData.month}/${payslipData.year}`, 350, infoY + 35);
        doc.moveDown(5);

        // Table Header
        let currentY = doc.y + 20;
        doc.fillColor('#10b981').rect(50, currentY, 500, 25).fill();
        doc.fillColor('#ffffff');
        if (fontBold) doc.font(fontBold);
        doc.text('รายการ (Description)', 60, currentY + 7);
        doc.text('จำนวนเงิน (Amount)', 400, currentY + 7, { align: 'right', width: 140 });
        currentY += 30;

        // Earnings
        doc.fillColor('#334155');
        if (fontRegular) doc.font(fontRegular);
        
        // Base Salary
        doc.text('เงินเดือนพื้นฐาน (Base Salary)', 60, currentY);
        doc.text(payslipData.earnings.baseSalary.toLocaleString(), 400, currentY, { align: 'right', width: 140 });
        currentY += 20;

        // OT
        doc.text(`ค่าล่วงเวลา (OT) - ${payslipData.earnings.otCount} ครั้ง`, 60, currentY);
        doc.text(payslipData.earnings.otPay.toLocaleString(), 400, currentY, { align: 'right', width: 140 });
        currentY += 25;

        // Details of routes
        doc.fontSize(9).fillColor('#64748b');
        Object.keys(payslipData.earnings.regularShifts).forEach(route => {
            doc.text(`• ${route} (${payslipData.earnings.regularShifts[route]} เที่ยว)`, 75, currentY);
            currentY += 15;
        });
        
        doc.fontSize(11).fillColor('#334155');
        doc.moveTo(50, currentY + 5).lineTo(550, currentY + 5).stroke('#e2e8f0');
        currentY += 20;

        // Deductions
        doc.fillColor('#ef4444');
        doc.text('หักประกันสังคม (Social Security)', 60, currentY);
        doc.text(`- ${payslipData.deductions.socialSecurity.toLocaleString()}`, 400, currentY, { align: 'right', width: 140 });
        currentY += 40;

        // Summary
        doc.rect(50, currentY, 500, 45).fill('#ecfdf5').stroke('#10b981');
        doc.fillColor('#065f46');
        if (fontBold) doc.font(fontBold);
        doc.fontSize(16).text('รายรับสุทธิ (Net Salary)', 65, currentY + 14);
        doc.text(`${payslipData.netSalary.toLocaleString()} บาท`, 350, currentY + 14, { align: 'right', width: 190 });

        // Footer
        doc.moveDown(5);
        if (fontRegular) doc.font(fontRegular);
        doc.fillColor('#64748b').fontSize(10);
        doc.text('เอกสารนี้จัดทำโดยระบบอัตโนมัติ ไม่ต้องมีลายเซ็นผู้จ่ายเงิน', 50, doc.y, { align: 'center' });
        
        doc.moveDown(2);
        doc.text('ลงชื่อ..........................................................', 350, doc.y);
        doc.text('(ผู้รับเงิน)     ', 415, doc.y + 15);

        doc.end();
        
        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
    });
};
