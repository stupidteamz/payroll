# ระบบจัดการเงินเดือน - ดาวรุ่ง ทราเวล (Branch: Development)

โปรเจกต์นี้แยกออกเป็น 2 สภาพแวดล้อม:

## 1. 🚀 Production (บน Render.com)
- **Branch:** `main` (อย่าแก้ Config ในเครื่องที่นี่!)
- **Database:** PostgreSQL บน Render
- **Frontend URL:** (URL ที่ได้จาก Render)

## 2. 💻 Local Development (บนคอมพี่เอฟ)
- **Branch:** `development` (สลับมาทำที่นี่เวลาจะแก้ไขหรือเทสบนคอม)
- **Database:** SQLite (`payroll.db` ในเครื่อง)
- **Frontend URL:** `http://localhost:5173`
- **Backend URL:** `http://localhost:3000`

---

### วิธีสลับ Branch:
- **ไปที่ Render (Production):** `git checkout main`
- **กลับมาทำในคอม (Local):** `git checkout development`

### การ Deploy:
1. แก้ไข Code ใน Branch `development` และเทสจนพอใจ
2. เมื่อต้องการขึ้นออนไลน์:
   ```bash
   git checkout main
   git merge development
   git push origin main
   ```
3. Render จะทำการ Auto-Deploy จาก `main` ทันทีครับ
