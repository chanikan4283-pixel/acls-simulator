# คู่มือ Resus Studio V4

ฉบับพัฒนา 4.0.0-preview.2 · ใช้ฝึกการตัดสินใจ ไม่ใช้สั่งรักษาผู้ป่วยจริง

## เปิดเกม

บนคอมพิวเตอร์เปิด play.html ในเว็บเบราว์เซอร์ หรือใช้ index.html ผ่านเว็บเซิร์ฟเวอร์ บน iPad ต้องเปิด URL ของเว็บที่โฮสต์ไฟล์นี้ — ลิงก์ localhost ของคอมพิวเตอร์ใช้จาก iPad อีกเครื่องไม่ได้ ขณะส่งมอบฉบับนี้ยังไม่ได้เผยแพร่เว็บใหม่

## เริ่มฝึก

1. เปิด ECG Rhythm Lab อ่าน rate, regularity, P, PR, QRS และ clinical context ก่อนเลือกคำตอบ
2. เลือกเคส อ่าน briefing ระหว่างกล้องแสดงห้องและผู้ป่วย กดเริ่มเมื่อพร้อม ไม่ต้องรอ cutscene จบ
3. เวลาเริ่มทันทีที่กดเริ่ม ใช้แถบล่างสั่งงานทีม
4. แตะ “ประเมิน” เพื่อตรวจ pulse/breathing และติด monitor จากนั้นเลือกการช่วยเหลือตามข้อมูล
5. เมื่อไม่แน่ใจใช้ “ช่วยคิด” ระบบบันทึกการใช้ hint เพื่อทบทวนภายหลัง

## แถบคำสั่ง

- ประเมิน: pulse/breathing, monitor, exam, history, 12-lead, flatline checks
- ช่วยชีวิต: CPR, switch compressor, rhythm check, oxygen, BVM, advanced airway
- ไฟฟ้า: pads, mode/energy, charge, hands-off/clear, shock, resume CPR, pacing
- ยา/Access: เปิด access แล้วเลือกยา ระบุ dose/unit/route และส่งคำสั่ง
- หาสาเหตุ: labs, history/exam, POCUS, working cause และ cause-directed team care
- ดูแลต่อ: ประเมินซ้ำ ตั้ง post-ROSC targets เมื่อมีข้อบ่งชี้ แล้วส่งมอบ

## ตัวอย่างฝึก Case 1

ประเมิน arrest → สั่ง CPR และติด monitor/pads → ใช้แผงไฟฟ้าชาร์จขณะทีมกด → hands-off/clear → shock → CPR ต่อ ใช้ช่วง CPR มอบหมาย access, ventilation, history/labs และค้นหาสาเหตุ ประเมิน rhythm เมื่อถึงรอบ ไม่ทำ stacked shocks ในซีนนี้ ทบทวนลำดับ epinephrine/antiarrhythmic ตาม AHA 2025 และเตรียมดูแลหลัง ROSC

เกมยอมรับ lidocaine เป็นทางเลือกของ amiodarone ตามขนาดที่กำหนด ไม่ต้องให้ทั้งสอง ยาแก้ hyperkalemia ระหว่าง arrest ไม่ใช่เงื่อนไขรับประกัน ROSC ในแบบจำลอง

## Pacing

ติด pads ก่อน เลือก rate/output และประเมิน electrical capture จาก monitor แล้วกดตรวจ pulse เพื่อยืนยัน mechanical capture การเห็น paced rhythm อย่างเดียวไม่พอ ต้องดู perfusion และวางแผน definitive care

## กล้องและการตั้งค่า

ใช้ปุ่มภาพรวม/ผู้ป่วย/Airway/Defib ได้โดยไม่ต้องลากกล้อง Standard เป็นค่าเริ่มต้นสำหรับหลายรุ่น ถ้ากระตุกเลือก Performance; รายละเอียด clinical information ไม่ถูกลดตามคุณภาพภาพ

ปิดเสียงได้โดยยังมีคำบรรยาย Reduce motion ลดการเคลื่อนกล้อง แต่คง animation ที่สื่อการทำหัตถการ

## เวลาและการพัก

แผงรักษาไม่พักเวลา คู่มือ/ข้อมูลอ้างอิงในโหมดฝึกพักเวลาและบันทึกเหตุการณ์ การสลับแอปหรือการหยุดตอบสนองนานจะพักอัตโนมัติ ให้กด ▶ เพื่อทำต่อ ระบบนี้ยังไม่ใช่ research-session policy ที่ PI รับรอง

## Debrief และ Export

กดจบ/ทบทวนได้แม้ทำเคสไม่เสร็จ ระบบแสดงเป้าหมายที่ทำแล้ว ข้อผิดพลาด เวลา และ compression fraction ซึ่งคำนวณเฉพาะช่วงที่จำลองว่าไม่มีชีพจร

Export JSON เก็บรายละเอียดทั้ง session; CSV เก็บ event timeline ไฟล์อยู่ใน Downloads หรือปลายทางที่เบราว์เซอร์เลือก คะแนนเป็น learning points ตาม rubric ของเกม ไม่ใช่คะแนนความรู้ 50 ข้อของงานวิจัย

ผลล่าสุดถูกเก็บในเบราว์เซอร์เครื่องนั้น การล้างข้อมูลเว็บอาจลบผลนี้ ควร export เมื่อจบ ยังไม่มีระบบส่งข้อมูลผู้เข้าร่วมขึ้นฐานข้อมูลวิจัย

## ข้อจำกัดที่ต้องทราบ

ภาพร่างกาย/หัตถการยังต้องตรวจความถูกต้องโดยผู้เชี่ยวชาญ โมเดลหน้าเป็น scan ดัดแปลงร่วมกับร่างกายที่สร้างจากโค้ด และยังไม่ใช่ facial rig ที่มี expression ครบระดับ production บางการรักษาเป็นคำสั่งให้ทีมดำเนินการตาม protocol ไม่ใช่ตัวจำลอง dosing เต็มรูปแบบทุกยา
