GCP Proyecto: Plataforma de Recargas de Saldo
Trabajo final - Arquitectura de microservicios en Google Cloud Platform (GCP).

1. Configuración Inicial del Proyecto, Zona y Región
# Selecciona el proyecto de GCP
gcloud config set project grounded-pivot-459800-v1
export PROYECTO=$(gcloud config get-value project)

# Define la zona y región por defecto
gcloud config set compute/zone us-central1-a
gcloud config set compute/region us-central1
2. Activación de APIs necesarias
gcloud services enable cloudfunctions.googleapis.com pubsub.googleapis.com firestore.googleapis.com
3. Clonar el Repositorio del Proyecto
git clone https://github.com/LorenaPortillo/gcp-examen-practico.git
cd gcp-examen-practico
git fetch origin master:master
git checkout master
4. Crear el Topic de Pub/Sub
gcloud pubsub topics create recargasv2
5. Desplegar el Frontend en Cloud Storage (Hosting Gratuito)
cd src/frontend

# Crear el bucket de almacenamiento
gsutil mb gs://frontend-ef

# Subir el archivo del frontend
gsutil cp index.html gs://frontend-ef

# Configurar el bucket para servir contenido web estático
gsutil web set -m index.html gs://frontend-ef

# Dar permisos públicos de solo lectura
gsutil iam ch allUsers:objectViewer gs://frontend-ef
Acceso al frontend:
http://storage.googleapis.com/frontend-ef/index.html

6. Backend: Recibir Recargas (Cloud Run)
cd ../backend

# (Solo la primera vez) Crear repositorio en Artifact Registry
gcloud artifacts repositories create microservicios --repository-format=docker --location=us-central1

# Configurar autenticación Docker para Artifact Registry
gcloud auth configure-docker us-central1-docker.pkg.dev

# Instalar dependencias si es necesario
npm install cors

# Construir y subir la imagen
docker build -t backend-ef:latest .
docker tag backend-ef:latest us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/backend-ef:latest
docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/backend-ef:latest

# Desplegar en Cloud Run
gcloud run deploy backend-ef \
  --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/backend-ef:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
7. Crear una Suscripción de Pub/Sub
gcloud pubsub subscriptions create recargasv2 --topic=recargasv2
8. Microservicio de Recarga: Procesamiento y Almacenamiento en Firestore (Cloud Run)
cd ../recarga

docker build -t recarga-ef:latest .
docker tag recarga-ef:latest us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-ef:latest
docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-ef:latest

gcloud run deploy recarga-ef \
  --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-ef:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
9. Actualizar Roles del Service Account
Asegúrate de que el Service Account tenga permisos de lectura en Artifact Registry:

gcloud projects add-iam-policy-binding grounded-pivot-459800-v1 \
  --member="serviceAccount:microservicios-auth@grounded-pivot-459800-v1.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.reader"
10. Microservicio de Ventas en GKE y Cloud Run
cd ../ventas

# Construir y subir la imagen
docker build -t us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta:latest .
docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta:latest

# Desplegar en Cloud Run (opcional)
gcloud run deploy registro-venta \
  --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Crear el clúster de GKE
gcloud container clusters create mi-cluster --zone=us-central1-a --num-nodes=1 --machine-type=e2-medium
gcloud container clusters get-credentials mi-cluster --zone=us-central1-a

# Desplegar recursos en GKE
kubectl apply -f registro-venta-deployment.yaml
kubectl apply -f registro-venta-ingress.yaml

# Verificar estado
kubectl get ingress
kubectl get services
kubectl get nodes -o wide
kubectl get pods
Obtener la IP del Ingress y probar el servicio:

kubectl get ingress

curl -X POST http://[EXTERNAL_IP]/registrar-venta \
  -H "Content-Type: application/json" \
  -d '{"numero":"5551234567","monto":50,"fecha":"2024-07-10T12:00:00Z"}'
11. Microservicio de Saldo en GKE y Cloud Run
cd ../saldo

docker build -t actualizar-saldo:latest .
docker tag actualizar-saldo:latest us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/actualizar-saldo:latest
docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/actualizar-saldo:latest

# Desplegar en Cloud Run
gcloud run deploy actualizar-saldo \
  --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/actualizar-saldo:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

# Desplegar en GKE
kubectl apply -f actualizar-saldo-deployment.yaml
kubectl apply -f actualizar-saldo-service.yaml
kubectl apply -f actualizar-saldo-ingress.yaml

# Verificar estado
kubectl get pods
kubectl get ingress
Probar el endpoint de saldo:

curl -X POST http://[EXTERNAL_IP]/actualizar-saldo \
  -H "Content-Type: application/json" \
  -d '{"numero":"5551234567","monto":50}'
