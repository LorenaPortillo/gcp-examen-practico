# gcp_proyecto
GCP proyecto trabajo final

# 1. Asignacion de proyecto zona y region

gcloud config set project grounded-pivot-459800-v1
export PROYECTO=$(gcloud config get-value project)

gcloud config set compute/zone us-central1-a
gcloud config set compute/region us-central1

# 2. Activación de APIs
gcloud services enable cloudfunctions.googleapis.com pubsub.googleapis.com firestore.googleapis.com

# 3. Clone the repo de Proyecto
git clone https://github.com/LorenaPortillo/gcp-examen-practico.git


# 4. Crear el Topic del Pub/Sub
gcloud pubsub topics create recargas


4. cd gcp_proyecto/src/frontend
     Frontend simple (HTML + JS) (NOTA: ESTO DEBE ESTAR ARRIBA REVISAR)

     Despliega el frontend en Cloud Storage (hosting gratuito)

     gsutil mb gs://$PROJECT_ID-bucket-html-01
     gsutil cp index.html gs://$PROJECT_ID-bucket-html-01
     gsutil web set -m index.html gs://$PROJECT_ID-bucket-html-01
     gsutil iam ch allUsers:objectViewer gs://$PROJECT_ID-bucket-html-01


    gsutil mb gs://mi-frontend-recargas
    gsutil cp index.html gs://mi-frontend-recargas   
    gsutil web set -m index.html gs://mi-frontend-recargas
    gsutil iam ch allUsers:objectViewer gs://mi-frontend-recargas



curl -X POST https://recarga-backend-411888293665.us-central1.run.app/recarga \
  -H "Content-Type: application/json" \
  -d '{"numero": "5512345678", "monto": 100}'
    

# Configura el bucket como web
gsutil web set -m index.html gs://mi-frontend-recargas

gsutil web set -m index.html gs://mi-frontend-recargas


     Accede por:
     http://storage.googleapis.com/$PROJECT_ID-bucket-html-01/index.html

 http://storage.googleapis.com/mi-frontend-recargas/index.html


5. Cloud Function HTTP para recibir recargas (frontend → backend)
    cd ../cloud-functions_recarga_request

    Despliegue en Cloud Run:
    Construye y sube la imagen

    gcloud builds submit --tag gcr.io/$PROJECT_ID/recarga-backend
    gcloud builds submit --tag gcr.io/grounded-pivot-459800-v1/recarga-backend


    Despliega en Cloud Run con AHORA AL PARECER TIENE QUE SER CON DOCKERFILE POR LO QUE SE DEBE AGREGAR EL Dockerfile y seguir estos pasos:
               Dockerfile
                    FROM node:20
                    WORKDIR /usr/src/app
                    COPY package*.json ./
                    RUN npm install
                    COPY . .
                    CMD ["node", "index.js"]
               # (Solo la primera vez) Crea el repositorio en Artifact Registry
               gcloud artifacts repositories create microservicios --repository-format=docker --location=us-central1
               
               # Configura autenticación Docker
               gcloud auth configure-docker us-central1-docker.pkg.dev
               
               # Construye y sube la imagen
               docker build -t recarga-backend:latest .
               docker tag recarga-backend:latest us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-backend:latest
               docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-backend:latest
               
               # Despliega en Cloud Run
               gcloud run deploy recarga-backend \
                 --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-backend:latest \
                 --platform managed \
                 --region us-central1 \
                 --allow-unauthenticated

6. Cloud Function backend (procesa la recarga y guarda en Firestore)
cd ../microservicio_procesar_recarga

 gcloud pubsub subscriptions create recarga-run-sub-a --topic=recargas

docker build -t recarga-firestore:latest .
docker tag recarga-firestore:latest us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-firestore:latest
docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-firestore:latest

               gcloud run deploy recarga-firestore \
                 --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/recarga-firestore:latest \
                 --platform managed \
                 --region us-central1 \
                 --allow-unauthenticated
 

   

----------------------------------------
gcloud builds submit --tag gcr.io/grounded-pivot-459800-v1/recarga-firestore-handler

gcloud run deploy recarga-firestore-handler \
  --image gcr.io/grounded-pivot-459800-v1/recarga-firestore-handler \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

#Crear la Subscripcion
gcloud pubsub subscriptions create recarga-firestore-handler-sub \
  --topic=recargas \
  --push-endpoint=https://recarga-firestore-handler-XXXXXXX-uc.a.run.app/ \
  --push-auth-service-account=YOUR_SERVICE_ACCOUNT@YOUR_PROJECT.iam.gserviceaccount.com


  gcloud pubsub subscriptions create recarga-run-sub --topic=recargas


  Ojo poner en el codigo de este microservicio 
  const firestore = new Firestore({ projectId: 'grounded-pivot-459800-v1' });
const pubsub = new PubSub({ projectId: 'grounded-pivot-459800-v1' });


7. cd ../microservicio_registro_de_ventas
    Construir y subir la imagen a Artifact Registry:

    docker build -t us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta:latest .
    docker tag registro-venta:latest us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta:latest
    docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta:latest

    kubectl apply -f registro-venta-deployment.yaml
    kubectl apply -f registro-venta-ingress.yaml

    kubectl get ingress

    gcloud run deploy registro-venta \
                 --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta:latest \
                 --platform managed \
                 --region us-central1 \
                 --allow-unauthenticated

Ojo *********** - mios
gcloud container clusters create mi-cluster \
  --zone us-central1-a \
  --num-nodes=1 \
  --machine-type=e2-micro


** Artifact Regisrty
gcloud builds submit --tag us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/registro-venta
** Container Registry
docker build -t gcr.io/grounded-pivot-459800-v1/registro-venta:latest .
docker push gcr.io/grounded-pivot-459800-v1/registro-venta:latest

**Verifica la imagen
gcloud container images list-tags gcr.io/grounded-pivot-459800-v1/registro-venta


gcloud container clusters get-credentials mi-cluster --zone us-central1-a --project grounded-pivot-459800-v1

***************
    Comandos de despliegue de .yaml
kubectl apply -f registro-venta-deployment.yaml
kubectl apply -f registro-venta-service.yaml
kubectl apply -f registro-venta-ingress.yaml


    Cuando el Ingress esté disponible, obtén la IP con:

    kubectl get ingress o. kubectl get services

    kubectl get nodes -o wide



    Y prueba el servicio (por ejemplo, con curl):

https://registro-venta-411888293665.us-central1.run.app/registrar-venta
{"numero":"5551234567","monto":50,"fecha":"2024-07-10T12:00:00Z"}


curl -X POST 35.186.228.131/registrar-venta \
  -H "Content-Type: application/json" \
  -d '{"numero":"5551234567","monto":50,"fecha":"2024-07-10T12:00:00Z"}'
    

    curl -X POST https://registro-venta-411888293665.us-central1.run.app/registrar-venta \
      -H "Content-Type: application/json" \
      -d '{"numero":"5551234567","monto":50,"fecha":"2024-07-10T12:00:00Z"}'


    curl -X POST http://35.186.228.131/registrar-venta \
  -H "Content-Type: application/json" \
  -d '{"numero":"5512345678","monto":100,"fecha":"2024-07-10T12:00:00Z"}'

curl http://registro-venta-5745b7c864-kwn2v/registrar-venta \
  -H "Content-Type: application/json" \
  -d '{"numero":"5512345678","monto":100,"fecha":"2024-07-10T12:00:00Z"}'



8. cd ../microservicio_de_actualizacion_de_saldo

    docker build -t actualizar-saldo:latest .
    docker tag actualizar-saldo:latest us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/actualizar-saldo:latest
    docker push us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/actualizar-saldo:latest

    gcloud run deploy actualizar-saldo \
                 --image us-central1-docker.pkg.dev/grounded-pivot-459800-v1/microservicios/actualizar-saldo:latest \
                 --platform managed \
                 --region us-central1 \
                 --allow-unauthenticated



    Despliega en GKE
    kubectl apply -f actualizar-saldo-deployment.yaml
    kubectl apply -f actualizar-saldo-service.yaml
    kubectl apply -f actualizar-saldo-ingress.yaml


    kubectl apply -f actualizar-saldo-deployment.yaml
    kubectl apply -f plataforma-recargas-ingress.yaml  # solo si es nuevo o cambió
    Obtén la IP pública (EXTERNAL-IP):

    kubectl get ingress
    Prueba el servicio

https://registro-venta-411888293665.us-central1.run.app

    curl -X POST https://registro-venta-411888293665.us-central1.run.app/actualizar-saldo \
      -H "Content-Type: application/json" \
      -d '{"numero":"5551234567","monto":50}'

9. Otros detalles técnicos:
    **Pasos básicos:**
       1. **Crea una cuenta de servicio de Google Cloud:**
          ```sh
          gcloud iam service-accounts create microservicios-auth
          ```
       2. **Dale permisos solo necesarios (ejemplo: acceso a Firestore):**
          ```sh
          gcloud projects add-iam-policy-binding TU_PROYECTO \
            --member="serviceAccount:microservicios-auth@TU_PROYECTO.iam.gserviceaccount.com" \
            --role="roles/datastore.user"

gcloud projects add-iam-policy-binding grounded-pivot-459800-v1 \
   --member="serviceAccount:microservicios-auth@grounded-pivot-459800-v1.iam.gserviceaccount.com" \
            --role="roles/datastore.user"


 gcloud container node-pools create nuevo-default-pool \
  --cluster=mi-cluster \
  --service-account=microservicios-auth@grounded-pivot-459800-v1.iam.gserviceaccount.com \
  --zone=us-central1-a \
  --num-nodes=2 \
  --machine-type=e2-medium     

Para borrar el cluster que no tenia service Account
  gcloud container node-pools delete default-pool --cluster=mi-cluster --zone=us-central1-a

# Agrega otros roles según necesidad

          ```
       3. **Habilita Workload Identity en tu clúster:**
          ```sh
          gcloud container clusters update TU_CLUSTER \
            --workload-pool=TU_PROYECTO.svc.id.goog
          ```
       4. **Crea un ServiceAccount de Kubernetes vinculado:**
          ```yaml
          apiVersion: v1
          kind: ServiceAccount
          metadata:
            name: k8s-firestore
            annotations:
              iam.gke.io/gcp-service-account: microservicios-auth@TU_PROYECTO.iam.gserviceaccount.com
          ```
       5. **Asigna este ServiceAccount a tus pods en el deployment:**
          ```yaml
          spec:
            serviceAccountName: k8s-firestore
          ```
       6. **Enlaza las identidades:**
          ```sh
          gcloud iam service-accounts add-iam-policy-binding microservicios-auth@TU_PROYECTO.iam.gserviceaccount.com \
            --role roles/iam.workloadIdentityUser \
            --member "serviceAccount:TU_PROYECTO.svc.id.goog[default/k8s-firestore]"

    ## 2. **Observabilidad: Cloud Logging y Monitoring**

    **Por defecto:**
    - **Todos los logs** de tus pods, Cloud Functions y Cloud Run se envían automáticamente a **Cloud Logging**.
    - **Métricas** de uso, errores y tráfico se envían a **Cloud Monitoring**.

    **¿Qué debes hacer?**
    - Añade logs personalizados en tus apps usando `console.log` (Node.js) o el equivalente en otros lenguajes.
    - Puedes crear dashboards y alertas en Cloud Monitoring.

    **Accede desde la consola:**
    - [Cloud Logging](https://console.cloud.google.com/logs)
    - [Cloud Monitoring](https://console.cloud.google.com/monitoring)

    ## 3. **Uso eficiente del nivel gratuito**

    - **GKE Autopilot:** 1 clúster gratis, suficiente para microservicios pequeños. No uses nodos grandes ni cargas pesadas.
    - **Firestore:** Hasta 1GB de almacenamiento gratis (usa documentos compactos).
    - **Cloud Functions:** Hasta 2 millones de invocaciones gratis (usa para funciones de backend asíncrono).
    - **Pub/Sub:** Hasta 10GB de mensajes gratis.
    - **Cloud Run:** Hasta 2 millones de invocaciones gratis y 360,000 GB-segundos/mes.

    **Tips:**
    - Elimina recursos que no uses.
    - Usa colecciones separadas en Firestore en vez de muchos proyectos.
    - Observa el uso en la consola de facturación.
    - Evita loops automáticos y verifica que tus triggers Pub/Sub o Cloud Functions no generen invocaciones inesperadas.

    ---

    ## 4. **Resumen de buenas prácticas**

    - **Desacoplamiento:** Usa Pub/Sub y microservicios independientes.
    - **Seguridad:** Workload Identity, no claves embebidas.
    - **Escalabilidad y resiliencia:** GKE Autopilot, Cloud Functions, Cloud Run.
    - **Observabilidad:** Usa Cloud Logging y Monitoring, crea alertas si quieres.
    - **Ahorro:** Mantente en la capa gratuita, revisa consumo en la consola.



/
        ├── frontend/
        │   └── index.html
├── cloud-functions/
        │   ├── recargaRequest/
        │   └── procesarRecarga/
        ├── registro-venta/
        │   ├── index.js
│   ├── Dockerfile
│   └── deployment.yaml
├── actualizar-saldo/
        │   ├── index.js
│   ├── Dockerfile
│   └── deployment.yaml
├── docs/
        │   └── diagrama.png
└── README.md





const {PubSub} = require('@google-cloud/pubsub');
const {Firestore} = require('@google-cloud/firestore');
const express = require('express');
 
const pubsub = new PubSub();
const firestore = new Firestore();
const subscriptionName = 'recarga-run-sub';
 
const app = express();
const PORT = process.env.PORT || 8080;
 
app.get('/', (req, res) => res.send('OK'));
app.listen(PORT, () => console.log(`Healthcheck en ${PORT}`));
 
function listenMessages() {
  const subscription = pubsub.subscription(subscriptionName);
  subscription.on('message', async (message) => {
    try {
      const data = message.json || JSON.parse(Buffer.from(message.data, 'base64').toString());
      await firestore.collection('recargas').add({
        numero: data.numero,
        monto: data.monto,
        fecha: data.fecha || new Date().toISOString(),
        status: 'procesada'
      });
      console.log(`Recarga procesada para ${data.numero} por ${data.monto}`);
      message.ack();
    } catch (err) {
      console.error('Error procesando mensaje:', err);
    }
  });
}
listenMessages();