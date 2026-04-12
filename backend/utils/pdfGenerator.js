const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Tahoma is common and supports Thai characters perfectly on Windows
const THAI_FONT_REGULAR = 'C:\\Windows\\Fonts\\tahoma.ttf';
const THAI_FONT_BOLD = 'C:\\Windows\\Fonts\\tahomabd.ttf';

exports.createPayslipPDF = (payslipData, stream) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 50 });

        doc.pipe(stream);

        // Header
        if (fs.existsSync(THAI_FONT_BOLD)) {
            doc.font(THAI_FONT_BOLD);
        }
        doc.fontSize(20).text('ใบแจ้งยอดเงินเดือน (Payslip)', { align: 'center' });
        doc.fontSize(16).text('ดาวรุ่ง ทราเวล (Dawrung Travel)', { align: 'center' });
        doc.moveDown();

        // Employee Info
        if (fs.existsSync(THAI_FONT_REGULAR)) {
            doc.font(THAI_FONT_REGULAR);
        }
        doc.fontSize(12);
        doc.text(`ชื่อพนักงาน: ${payslipData.thaiName}`);
        doc.text(`รหัสพนักงาน: ${payslipData.employeeId}`);
        doc.text(`ตำแหน่ง: ${payslipData.position || '-'}`);
        doc.text(`ประจำเดือน: ${payslipData.month}/${payslipData.year}`);
        doc.moveDown();

        // Table Header
        const startX = 50;
        let currentY = doc.y;
        if (fs.existsSync(THAI_FONT_BOLD)) doc.font(THAI_FONT_BOLD);
        doc.rect(startX, currentY, 500, 20).stroke();
        doc.text('รายการ (Description)', startX + 5, currentY + 5);
        doc.text('จำนวนเงิน (Amount)', startX + 400, currentY + 5);
        currentY += 25;

        // Earnings
        if (fs.existsSync(THAI_FONT_REGULAR)) doc.font(THAI_FONT_REGULAR);
        doc.text('เงินเดือนพื้นฐาน (Base Salary)', startX + 5, currentY);
        doc.text(payslipData.earnings.baseSalary.toLocaleString(), startX + 400, currentY, { align: 'right', width: 90 });
        currentY += 20;

        doc.text(`ค่าล่วงเวลา (OT) - ${payslipData.earnings.otCount} ครั้ง`, startX + 5, currentY);
        doc.text(payslipData.earnings.otPay.toLocaleString(), startX + 400, currentY, { align: 'right', width: 90 });
        currentY += 20;

        // Regular Shifts
        Object.keys(payslipData.earnings.regularShifts).forEach(route => {
            doc.fontSize(10).text(`- ${route} (${payslipData.earnings.regularShifts[route]} เที่ยว)`, startX + 15, currentY);
            currentY += 15;
        });
        doc.fontSize(12);

        doc.moveDown();
        currentY = doc.y;
        doc.lineCap('butt').moveTo(startX, currentY).lineTo(startX + 500, currentY).stroke();
        currentY += 10;

        // Deductions
        doc.text('หักประกันสังคม (Social Security)', startX + 5, currentY);
        doc.text(payslipData.deductions.socialSecurity.toLocaleString(), startX + 400, currentY, { align: 'right', width: 90 });
        currentY += 30;

        // Summary
        doc.rect(startX, currentY, 500, 40).stroke();
        if (fs.existsSync(THAI_FONT_BOLD)) doc.font(THAI_FONT_BOLD);
        doc.fontSize(14).text('รายรับสุทธิ (Net Salary)', startX + 5, currentY + 12);
        doc.text(`${payslipData.netSalary.toLocaleString()} บาท`, startX + 350, currentY + 12, { align: 'right', width: 140 });

        doc.moveDown(4);
        if (fs.existsSync(THAI_FONT_REGULAR)) doc.font(THAI_FONT_REGULAR);
        doc.fontSize(10).text('ลงชื่อ..........................................................', { align: 'right' });
        doc.text('(ผู้รับเงิน)     ', { align: 'right' });

        doc.end();
        
        stream.on('finish', () => resolve());
        stream.on('error', (err) => reject(err));
    });
};
