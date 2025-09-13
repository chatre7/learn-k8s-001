Ingress แผนงานและขั้นตอนลงมือทำ

เอกสารนี้อธิบายว่าเราจะย้ายจากการใช้ Nginx เป็น reverse proxy ในคลัสเตอร์ ไปใช้ Kubernetes Ingress โดยมี Ingress Controller (ingress-nginx) และ Ingress Resource ที่ทำ Path-based routing ไปยัง Services ของ nodejs-service-1 และ nodejs-service-2

เป้าหมาย
- ใช้ Ingress ทำให้เข้าถึงบริการผ่านโดเมน/เส้นทางเดียว เช่น:
  - http://localhost/service1 -> nodejs-service-1:3001
  - http://localhost/service2 -> nodejs-service-2:3002
- ลดความซ้ำซ้อนจาก Nginx Deployment/Service ภายในคลัสเตอร์ (สามารถถอดออกได้หลังย้ายเสร็จ)

สิ่งที่จะทำ
- ติดตั้ง Ingress Controller: ingress-nginx
- สร้างไฟล์ Ingress Resource สำหรับ path-based routing
- ทดสอบการเข้าถึงและตรวจสอบสถานะ
- (ทางเลือก) ถอด nginx Deployment/Service/ConfigMap เดิมออก
- (ทางเลือก) เพิ่ม TLS ด้วย Secret

ขั้นตอนลงมือทำ

1) ติดตั้ง Ingress Controller (ingress-nginx)
- วิธีมาตรฐาน (ต้องมีอินเทอร์เน็ต) ด้วย manifest จากโครงการทางการ:
  - kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
- รอให้ Controller พร้อมใช้งาน:
  - kubectl get pods -n ingress-nginx -w
  - ตรวจสอบ Service ของ Controller:
  - kubectl get svc -n ingress-nginx
  - บน Docker Desktop มักจะแสดง External-IP เป็น localhost

2) สร้าง Ingress Resource (ตัวอย่างไฟล์: k8s/ingress.yaml)
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: web
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  ingressClassName: nginx
  rules:
    - host: localhost
      http:
        paths:
          - path: /service1/?(.*)
            pathType: Prefix
            backend:
              service:
                name: nodejs-service-1
                port:
                  number: 3001
          - path: /service2/?(.*)
            pathType: Prefix
            backend:
              service:
                name: nodejs-service-2
                port:
                  number: 3002
- หมายเหตุ: ใช้ annotation rewrite-target เพื่อตัด prefix /service1 หรือ /service2 ออกก่อนส่งถึงแอป หากแอปต้องการคง path เดิม สามารถลบ annotation นี้ได้และปรับ route ในแอปตามต้องการ

3) Apply Ingress
- kubectl apply -f k8s/ingress.yaml
- ตรวจสอบ:
  - kubectl get ingress
  - kubectl describe ingress web

4) ทดสอบการเข้าถึง
- curl http://localhost/service1/
- curl http://localhost/service2/

5) (ทางเลือก) ถอด Nginx เดิมออกเมื่อย้ายสำเร็จ
- kubectl delete deploy/nginx svc/nginx configmap/nginx-config
- หลังถอด Nginx เดิม การรับทราฟฟิกจะผ่าน Ingress Controller ทั้งหมด

6) (ทางเลือก) เปิดใช้ TLS
- สร้าง Secret จากใบรับรอง (ตัวอย่าง self-signed):
  - kubectl create secret tls demo-tls --cert=cert.crt --key=cert.key
- เพิ่มส่วน tls ใน Ingress:
spec:
  tls:
    - hosts: ["localhost"]
      secretName: demo-tls
  rules:
    - host: localhost
      http:
        paths:
          ...
- ทดสอบ https://localhost/

Troubleshooting
- kubectl get pods -n ingress-nginx ดูว่าคอนโทรลเลอร์ Ready หรือไม่
- kubectl describe ingress web ตรวจสอบกฎ routing/เหตุการณ์ผิดพลาด
- kubectl get svc nodejs-service-1 -o yaml ตรวจสอบพอร์ต Service (ต้องเปิดที่ 3001) เช่นเดียวกันกับ service-2 (3002)
- ถ้าใช้ host อื่นแทน localhost ให้เพิ่ม DNS/hosts (C:\\Windows\\System32\\drivers\\etc\\hosts) ชี้ไปที่ 127.0.0.1

หมายเหตุสำหรับโปรเจกต์นี้
- ปัจจุบันมี nginx แบบ LoadBalancer อยู่แล้ว ซึ่งทำหน้าที่ reverse proxy เหมือน Ingress
- เมื่อใช้ Ingress แล้วสามารถลบ k8s/nginx-*.yaml เพื่อให้เหลือ Ingress เป็นจุดทางเข้าเพียงจุดเดียว ลดซ้ำซ้อนและง่ายต่อการจัดการ
