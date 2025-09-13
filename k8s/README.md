Kubernetes manifests converted from example/docker-compose.yml

What's included
- nginx Deployment + Service (LoadBalancer)
- nginx ConfigMap for nginx.conf
- nodejs-service-1 Deployment + ClusterIP Service (port 3001)
- nodejs-service-2 Deployment + ClusterIP Service (port 3002)

Notes
- Build and push the Node API image and update the image field if needed in:
  - k8s/nodejs-service-1-deployment.yaml
  - k8s/nodejs-service-2-deployment.yaml
- Adjust the nginx.conf in k8s/nginx-configmap.yaml to match your desired routing. It currently maps:
  - /service1 -> nodejs-service-1:3001
  - /service2 -> nodejs-service-2:3002

Apply
- kubectl apply -f k8s/

Build local image (Docker Desktop)
- docker build -t node-api:latest example/node-api

K8s uses env to set ports
- nodejs-service-1 sets PORT=3001, SERVICE_NAME=service1
- nodejs-service-2 sets PORT=3002, SERVICE_NAME=service2

Notes for Docker Desktop
- Manifests use `image: node-api:latest` with `imagePullPolicy: IfNotPresent`
  so Kubernetes uses your local image without pulling.
  If you change the tag, update both Deployment YAMLs accordingly.
