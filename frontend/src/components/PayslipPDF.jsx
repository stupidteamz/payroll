import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register Thai Font (Using Sarabun from Google Fonts CDN)
Font.register({
  family: 'Sarabun',
  src: 'https://cdn.jsdelivr.net/gh/googlefonts/sarabun@main/fonts/ttf/Sarabun-Regular.ttf',
});
Font.register({
  family: 'Sarabun-Bold',
  src: 'https://cdn.jsdelivr.net/gh/googlefonts/sarabun@main/fonts/ttf/Sarabun-Bold.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Sarabun',
    fontSize: 12,
    color: '#333',
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
    textAlign: 'center',
  },
  companyName: {
    fontSize: 18,
    fontFamily: 'Sarabun-Bold',
    color: '#3b82f6',
  },
  title: {
    fontSize: 14,
    marginTop: 5,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    paddingBottom: 2,
  },
  label: {
    color: '#666',
  },
  value: {
    fontFamily: 'Sarabun-Bold',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#999',
  },
  totalBox: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 5,
  }
});

const PayslipPDF = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>ดาวรุ่ง ทราเวล (Dawrung Travel)</Text>
        <Text style={styles.title}>สลิปเงินเดือนประจำเดือน {data.month}/{data.year}</Text>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, marginBottom: 10, color: '#3b82f6' }}>ข้อมูลพนักงาน</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ชื่อ-นามสกุล:</Text>
          <Text style={styles.value}>{data.thaiName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>รหัสพนักงาน:</Text>
          <Text style={styles.value}>{data.employeeId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ตำแหน่ง:</Text>
          <Text style={styles.value}>{data.position || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, marginBottom: 10, color: '#22c55e' }}>รายรับ (Earnings)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>เงินเดือนพื้นฐาน:</Text>
          <Text style={styles.value}>฿{data.earnings.baseSalary.toLocaleString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ค่า OT ({data.earnings.otCount} เที่ยว):</Text>
          <Text style={styles.value}>฿{data.earnings.otPay.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ fontSize: 14, marginBottom: 10, color: '#ef4444' }}>รายหัก (Deductions)</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ประกันสังคม:</Text>
          <Text style={styles.value}>฿{data.deductions.socialSecurity.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.totalBox}>
        <View style={styles.row}>
          <Text style={{ fontSize: 14, fontFamily: 'Sarabun-Bold' }}>รายรับสุทธิ (Net Salary):</Text>
          <Text style={{ fontSize: 16, fontFamily: 'Sarabun-Bold', color: '#1e2d45' }}>฿{data.netSalary.toLocaleString()}</Text>
        </View>
        <View style={{ marginTop: 5 }}>
          <Text style={{ fontSize: 10, color: '#666' }}>โอนเข้าบัญชี: {data.bankName} เลขที่ {data.bankAccountNumber || '-'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text>เอกสารนี้ออกโดยระบบอัตโนมัติ ไม่ต้องมีลายเซ็นก็มีผลสมบูรณ์</Text>
        <Text>พิมพ์เมื่อวันที่: {new Date().toLocaleDateString('th-TH')}</Text>
      </View>
    </Page>
  </Document>
);

export default PayslipPDF;
