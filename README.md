learn-k8s-001

Overview
- Kubernetes demo with a simple Node.js API and manifests.
- Main branch uses an in-cluster Nginx reverse proxy exposed as a LoadBalancer.
- Ingress-feature branch replaces the in-cluster Nginx with ingress-nginx + Ingress.

Prerequisites
- Docker Desktop (with Kubernetes enabled)
- kubectl (configured to your Docker Desktop cluster)
- curl (for quick testing)

Repository Structure
- example/docker-compose.yml: illustrative compose file (not wired to node-api)
- example/node-api: simple Express server used by both K8s services
- k8s/: Kubernetes manifests (Deployments/Services; Ingress in feature branch)

Build the App Image
- docker build -t node-api:latest example/node-api

Deploy (Main Branch: Nginx LoadBalancer)
- kubectl apply -f k8s/
- kubectl get pods -w
- Access via Nginx LoadBalancer on localhost:
  - http://localhost/service1/
  - http://localhost/service2/

Ingress (Feature Branch)
- Checkout feature branch: git checkout Ingress-feature
- Install controller (internet required):
  - kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/main/deploy/static/provider/cloud/deploy.yaml
- Apply manifests:
  - kubectl apply -f k8s/
- Test routes:
  - curl http://localhost/service1/
  - curl http://localhost/service2/

Development Workflow
- After code changes:
  - docker build -t node-api:latest example/node-api
  - kubectl rollout restart deploy nodejs-service-1 nodejs-service-2
- The app reads env vars:
  - PORT (service-1 uses 3001; service-2 uses 3002)
  - SERVICE_NAME (service1/service2 for friendly responses)

Troubleshooting
- ImagePullBackOff / ErrImagePull:
  - Ensure the local image tag matches the Deployment (node-api:latest).
  - imagePullPolicy is set to IfNotPresent; you can set Never to force local-only.
  - Verify: docker images | findstr node-api
- Verify services and endpoints:
  - kubectl get svc
  - kubectl describe svc nodejs-service-1
  - kubectl logs deploy/nodejs-service-1

Cleanup
- kubectl delete -f k8s/

Notes
- The compose file under example/ is for reference; the K8s manifests are the primary path.
