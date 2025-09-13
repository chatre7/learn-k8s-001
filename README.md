learn-k8s-001

ภาพรวม
- โปรเจกต์เดโม Kubernetes ที่มี Node.js API และไฟล์แมนิเฟสต์ครบชุด
- สาขา main ใช้ Nginx ภายในคลัสเตอร์แบบ LoadBalancer (reverse proxy)
- สาขา Ingress-feature ใช้ Ingress Controller (ingress-nginx) + Ingress แทน Nginx ภายใน

ข้อกำหนดเบื้องต้น
- ติดตั้ง Docker Desktop และเปิด Kubernetes
- ติดตั้ง `kubectl` ให้ชี้ไปที่คลัสเตอร์ Docker Desktop
- มี `curl` สำหรับทดสอบอย่างรวดเร็ว

โครงสร้างโปรเจกต์ (ลิงก์)
- ตัวอย่าง Compose: [example/docker-compose.yml](example/docker-compose.yml)
- โค้ดแอป Node.js: [example/node-api](example/node-api)
- แมนิเฟสต์ Kubernetes: [k8s/](k8s)
- แผนงาน Ingress: [k8s/Ingress.md](k8s/Ingress.md)
- ไฟล์ Ingress (อยู่ในสาขา Ingress-feature): [k8s/ingress.yaml](k8s/ingress.yaml)

สร้างอิมเมจแอป
- `docker build -t node-api:latest example/node-api`

การดีพลอย (สาขา main: Nginx เป็น LoadBalancer)
- เช็คเอาท์ไปสาขา main: `git checkout main`
- ดีพลอย: `kubectl apply -f k8s/`
- ดูสถานะ: `kubectl get pods -w`
- ทดสอบผ่าน Nginx (localhost):
  - http://localhost/service1/
  - http://localhost/service2/

การดีพลอยด้วย Ingress (สาขา Ingress-feature)
- เช็คเอาท์: `git checkout Ingress-feature`
- ติดตั้ง Ingress Controller (ต้องมีอินเทอร์เน็ต):
  - `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml`
- Apply แมนิเฟสต์: `kubectl apply -f k8s/`
- ทดสอบ:
  - `curl http://localhost/service1/`
  - `curl http://localhost/service2/`

เวิร์กโฟลว์การพัฒนา
- เมื่อแก้โค้ดแล้ว: 
  - `docker build -t node-api:latest example/node-api`
  - `kubectl rollout restart deploy nodejs-service-1 nodejs-service-2`
- แอปรับค่า ENV:
  - `PORT` (service-1 ใช้ 3001, service-2 ใช้ 3002)
  - `SERVICE_NAME` (เช่น `service1`/`service2` สำหรับข้อความตอบกลับ)

การแก้ปัญหา (Troubleshooting)
- ImagePullBackOff / ErrImagePull:
  - ตรวจสอบว่าแท็กอิมเมจในเครื่องตรงกับ Deployment (`node-api:latest`)
  - ค่า `imagePullPolicy` เป็น `IfNotPresent`; กรณีอยากบังคับใช้เฉพาะอิมเมจในเครื่อง ใช้ `Never`
  - ตรวจสอบอิมเมจ: `docker images | findstr node-api`
- ตรวจสอบบริการ/ปลายทาง:
  - `kubectl get svc`
  - `kubectl describe svc nodejs-service-1`
  - `kubectl logs deploy/nodejs-service-1`

ล้างทรัพยากร
- `kubectl delete -f k8s/`

ลิงก์ที่เกี่ยวข้อง
- สาขา Ingress-feature: https://github.com/chatre7/learn-k8s-001/tree/Ingress-feature
- สร้าง PR เปรียบเทียบ: https://github.com/chatre7/learn-k8s-001/compare/main...Ingress-feature

หมายเหตุ
- ไฟล์ Compose ในโฟลเดอร์ `example/` มีไว้สำหรับอ้างอิง ส่วนการใช้งานหลักอยู่ที่ไฟล์ K8s ในโฟลเดอร์ `k8s/`
