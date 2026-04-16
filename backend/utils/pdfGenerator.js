const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const FONT_REGULAR = path.join(__dirname, '..', 'fonts', 'Kanit-Regular.ttf');
const FONT_BOLD = path.join(__dirname, '..', 'fonts', 'Kanit-Bold.ttf');

const getFont = (type = 'regular') => {
    const f = type === 'bold' ? FONT_BOLD : FONT_REGULAR;
    return fs.existsSync(f) ? f : null;
};

exports.createPayslipPDF = (data, stream) => {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ size: 'A4', margin: 30 });
        doc.pipe(stream);

        const fReg = getFont('regular');
        const fBold = getFont('bold');
        if (fReg) doc.font(fReg);

        // Header Section
        doc.fontSize(14);
        if (fBold) doc.font(fBold);
        doc.text('บริษัท ดาวรุ่งทราเวล จำกัด', 50, 40);
        doc.fontSize(10);
        if (fReg) doc.font(fReg);
        doc.text('89/107 หมู่ 9 ต.ต้นเปา อ.สันกำแพง จ.เชียงใหม่ 50130', 50, 58);
        doc.text('Tel. 053-446033  E-mail: daorung.lp@gmail.com', 50, 72);

        doc.fontSize(14);
        if (fBold) doc.font(fBold);
        doc.text('ใบแจ้งเงินเดือน', 400, 40, { align: 'right' });
        doc.fontSize(12);
        doc.text('( Pay SLIP )', 400, 58, { align: 'right' });

        doc.moveTo(30, 95).lineTo(565, 95).stroke();

        // Info Grid
        let y = 105;
        doc.fontSize(10);
        const drawField = (label, value, x, y, width = 250) => {
            if (fBold) doc.font(fBold);
            doc.text(`${label} :`, x, y);
            if (fReg) doc.font(fReg);
            doc.text(value, x + 80, y, { width: width - 80 });
        };

        drawField('ชื่อพนักงาน', data.thaiName, 50, y);
        drawField('ประจำสาขา', 'ลำพูน', 320, y);
        y += 18;
        drawField('ตำแหน่ง', data.position || 'พนักงานขับรถ', 50, y);
        drawField('หมายเลขบัญชี', data.bankAccountNumber || '-', 320, y);
        y += 18;
        drawField('ทะเบียนรถ', data.plateNumber, 50, y);
        drawField('ชื่อธนาคาร', data.bankName || 'กสิกรไทย', 320, y);
        y += 18;
        drawField('ประจำเดือน', `เดือน ${data.month} ปี ${data.year + 543}`, 50, y);
        drawField('วันที่จ่ายเงิน', new Date().toLocaleDateString('th-TH'), 320, y);

        y += 25;
        // Table Header
        doc.rect(30, y, 267, 20).fillAndStroke('#f1f5f9', '#334155');
        doc.rect(297, y, 268, 20).fillAndStroke('#f1f5f9', '#334155');
        doc.fillColor('#000');
        if (fBold) doc.font(fBold);
        doc.text('รายได้', 30, y + 5, { width: 267, align: 'center' });
        doc.text('รายการหัก', 297, y + 5, { width: 268, align: 'center' });
        
        y += 20;
        const tableTop = y;
        const rowH = 18;
        if (fReg) doc.font(fReg);

        // Earnings Rows
        const earnings = [
            ['เงินเดือน', data.earnings.baseSalary],
            ['Overtime วันหยุด', data.earnings.otHoliday],
            ['Overtime วันอาทิตย์', data.earnings.otSunday],
            ['Overtime วิ่งแทน', data.earnings.otExtra],
            ['การแต่งกาย, ความสะอาด', data.earnings.clothingAllowance],
            ['อื่นๆ (ที่พัก,น้ำ,ไฟ)', data.earnings.utilityAllowance],
            ['อื่นๆ', 0]
        ];

        // Deductions Rows
        const deductions = [
            ['ประกันสังคม', data.deductions.socialSecurity],
            ['เงินสัปดาห์', 0],
            ['เงินเบิกล่วงหน้า', data.deductions.advances],
            ['ขาดงาน', 0],
            ['อื่นๆ', 0],
            ['เงินค้ำประกัน', data.deductions.deposit]
        ];

        let curY = tableTop;
        for (let i = 0; i < 7; i++) {
            doc.rect(30, curY, 200, rowH).stroke();
            doc.rect(230, curY, 67, rowH).stroke();
            doc.rect(297, curY, 200, rowH).stroke();
            doc.rect(497, curY, 68, rowH).stroke();

            if (earnings[i]) {
                doc.text(earnings[i][0], 35, curY + 4);
                if (earnings[i][1] > 0) doc.text(earnings[i][1].toLocaleString(), 230, curY + 4, { width: 62, align: 'right' });
            }
            if (deductions[i]) {
                doc.text(deductions[i][0], 302, curY + 4);
                if (deductions[i][1] > 0) doc.text(deductions[i][1].toLocaleString(), 497, curY + 4, { width: 63, align: 'right' });
            }
            curY += rowH;
        }

        // Summary Row
        if (fBold) doc.font(fBold);
        doc.rect(30, curY, 200, rowH).fillAndStroke('#f8fafc', '#334155');
        doc.rect(230, curY, 67, rowH).fillAndStroke('#f8fafc', '#334155');
        doc.rect(297, curY, 200, rowH).fillAndStroke('#f8fafc', '#334155');
        doc.rect(497, curY, 68, rowH).fillAndStroke('#f8fafc', '#334155');
        doc.fillColor('#000');
        
        const totalEarnings = data.earnings.baseSalary + data.earnings.otHoliday + data.earnings.otSunday + data.earnings.otExtra + data.earnings.clothingAllowance + data.earnings.utilityAllowance;
        const totalDeductions = data.deductions.socialSecurity + data.deductions.advances + data.deductions.deposit;

        doc.text('รวมรายได้', 35, curY + 4);
        doc.text(totalEarnings.toLocaleString(), 230, curY + 4, { width: 62, align: 'right' });
        doc.text('รวมรายการหัก', 302, curY + 4);
        doc.text(totalDeductions.toLocaleString(), 497, curY + 4, { width: 63, align: 'right' });

        curY += rowH;
        // Net Salary
        doc.rect(30, curY, 535, 25).fillAndStroke('#f0f9ff', '#0284c7');
        doc.fillColor('#0369a1');
        doc.fontSize(12).text('รวมรายได้สุทธิ', 35, curY + 6, { width: 267, align: 'center' });
        doc.text(`${data.netSalary.toLocaleString()} บาท`, 297, curY + 6, { width: 268, align: 'center' });

        curY += 30;
        // Footer Stats
        doc.fontSize(10).fillColor('#000');
        doc.rect(30, curY, 267, 20).stroke();
        doc.rect(297, curY, 268, 20).stroke();
        doc.text(`งวดค้ำประกัน : ${data.installmentCount}`, 40, curY + 5);
        doc.text(`จำนวนหักเงินค้ำประกันสะสม : ${data.accumulatedDeposit.toLocaleString()} บาท`, 307, curY + 5);

        y = curY + 40;
        doc.text('หมายเหตุ : ..........................................................................................................................................................', 30, y);
        y += 30;
        doc.text('ลงชื่อ ................................................................. ( ผู้รับเงิน )', 300, y);

        doc.end();
        stream.on('finish', resolve);
    });
};
