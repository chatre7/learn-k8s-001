Kubernetes manifests converted from example/docker-compose.yml

What's included
- Ingress resource (requires ingress-nginx controller)
- nodejs-service-1 Deployment + ClusterIP Service (port 3001)
- nodejs-service-2 Deployment + ClusterIP Service (port 3002)

Notes
- Build and push the Node API image and update the image field if needed in:
  - k8s/nodejs-service-1-deployment.yaml
  - k8s/nodejs-service-2-deployment.yaml
- This branch uses Ingress for path-based routing instead of an internal Nginx Deployment.

Apply
- Ensure ingress-nginx is installed (internet required):
  - kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
- Apply manifests:
  - kubectl apply -f k8s/
- Test endpoints:
  - http://localhost/service1/
  - http://localhost/service2/

Build local image (Docker Desktop)
- docker build -t node-api:latest example/node-api

K8s uses env to set ports
- nodejs-service-1 sets PORT=3001, SERVICE_NAME=service1
- nodejs-service-2 sets PORT=3002, SERVICE_NAME=service2

Notes for Docker Desktop
- Manifests use `image: node-api:latest` with `imagePullPolicy: IfNotPresent`
  so Kubernetes uses your local image without pulling.
  If you change the tag, update both Deployment YAMLs accordingly.

Removed legacy Nginx (in this branch)
- The previous Nginx Deployment/Service/ConfigMap were removed in favor of Ingress.
