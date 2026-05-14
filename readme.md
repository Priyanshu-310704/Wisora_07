# Wisora — Full Stack DevOps & Monitoring Infrastructure

## Overview

Wisora is a backend-focused cloud and DevOps project that demonstrates how a modern production-style application can be:

* Containerized using Docker
* Provisioned using Terraform
* Deployed on AWS EC2
* Automated using Jenkins CI/CD
* Monitored using Prometheus & Grafana

This project simulates a real-world backend deployment workflow used in startups and production environments.

---

# Architecture

```text
Developer Pushes Code
        ↓
GitHub Repository
        ↓
Jenkins CI/CD Pipeline
        ↓
Docker Image Build
        ↓
Push To DockerHub
        ↓
Deploy To AWS EC2
        ↓
Prometheus Scrapes Metrics
        ↓
Grafana Visualizes Metrics
```

---

# Tech Stack

## Backend

* Node.js
* Express.js

## DevOps & Cloud

* Docker
* Jenkins
* Terraform
* AWS EC2
* DockerHub

## Monitoring

* Prometheus
* Grafana
* Node Exporter

---

# Project Structure

```text
Wisora_07/
│
├── app/
│   ├── controllers/
│   ├── routes/
│   ├── middlewares/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── package.json
│
├── terraform/
│   ├── main.tf
│   ├── outputs.tf
│   └── variables.tf
│
├── monitoring/
│   └── prometheus.yml
│
├── Dockerfile
├── Jenkinsfile
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

# Step 1 — Clone Repository

```bash
git clone <your-repository-url>
cd Wisora_07
```

---

# Step 2 — Dockerizing the Application

## Why Docker?

Docker allows applications to run in isolated environments called containers.
This ensures:

* Consistent deployments
* Environment isolation
* Easier scalability
* Platform-independent execution

---

## Create Dockerfile

```dockerfile
FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

---

## Build Docker Image

```bash
docker build -t wisora-app .
```

---

## Run Docker Container

```bash
docker run -d -p 3000:3000 --name app wisora-app
```

---

## Verify Application

Open:

```text
http://localhost:3000
```

---

# Step 3 — Terraform Infrastructure Setup

## Why Terraform?

Terraform is used for Infrastructure as Code (IaC).
Instead of manually creating cloud resources, Terraform automates infrastructure provisioning.

Benefits:

* Reproducible infrastructure
* Version-controlled infrastructure
* Automated provisioning
* Easier scaling

---

## Install Terraform

### Ubuntu

```bash
sudo apt update
sudo apt install terraform
```

### Verify

```bash
terraform -version
```

---

# Step 4 — Configure AWS Credentials

Install AWS CLI:

```bash
sudo apt install awscli -y
```

Configure credentials:

```bash
aws configure
```

Provide:

```text
AWS Access Key
AWS Secret Key
Region
Output format
```

---

# Step 5 — Create Terraform Infrastructure

## main.tf

```hcl
provider "aws" {
  region = "ap-south-1"
}

resource "aws_security_group" "app_sg" {
  name = "app-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 3001
    to_port     = 3001
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 9100
    to_port     = 9100
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

---

# Step 6 — Create EC2 Instances

This project uses:

| Instance       | Purpose                     |
| -------------- | --------------------------- |
| Jenkins Server | CI/CD Pipeline              |
| App Server     | Runs App + Monitoring Stack |

---

## Jenkins EC2

Used for:

* CI/CD automation
* Docker image build
* Deployment automation
* GitHub integration

---

## App EC2

Used for:

* Running application container
* Prometheus
* Grafana
* Node Exporter

---

# Step 7 — Initialize Terraform

```bash
terraform init
```

---

# Step 8 — Preview Infrastructure

```bash
terraform plan
```

---

# Step 9 — Create Infrastructure

```bash
terraform apply
```

Type:

```text
yes
```

Terraform provisions:

* Security Groups
* EC2 Instances
* Elastic IPs
* Networking rules

---

# Step 10 — Setup Jenkins Server

SSH into Jenkins EC2:

```bash
ssh -i key.pem ubuntu@<jenkins-public-ip>
```

---

## Install Docker

```bash
sudo apt update
sudo apt install docker.io -y

sudo systemctl start docker
sudo systemctl enable docker
```

---

## Run Jenkins Container

```bash
docker run -d \
  --restart unless-stopped \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  jenkins/jenkins:lts
```

---

## Access Jenkins

```text
http://<jenkins-public-ip>:8080
```

---

## Get Jenkins Admin Password

```bash
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

---

# Step 11 — Jenkins Pipeline Setup

## Install Plugins

Install:

* Docker Pipeline
* SSH Agent
* GitHub Integration
* Pipeline

---

## Add Jenkins Credentials

### DockerHub Credentials

Add:

* DockerHub username
* DockerHub password

Credential ID:

```text
docker-hub
```

---

### EC2 SSH Key

Add:

* EC2 private key

Credential ID:

```text
ec2-key
```

---

# Step 12 — Jenkinsfile

```groovy
pipeline {
    agent any

    environment {
        IMAGE_NAME = "yourdockerhub/wisora"
        IMAGE_TAG = "v1"
        IMAGE = "${IMAGE_NAME}:${IMAGE_TAG}"
        APP_IP = "YOUR_APP_PUBLIC_IP"
    }

    stages {

        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'YOUR_GITHUB_REPO'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t $IMAGE .'
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-hub',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                    echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                    docker push $IMAGE
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(['ec2-key']) {
                    sh """
                    ssh -o StrictHostKeyChecking=no ubuntu@$APP_IP '
                        docker pull yourdockerhub/wisora:v1 &&
                        docker stop app || true &&
                        docker rm app || true &&
                        docker run -d -p 3000:3000 --name app yourdockerhub/wisora:v1
                    '
                    """
                }
            }
        }
    }
}
```

---

# Step 13 — Setup Monitoring Stack

## Why Monitoring?

Monitoring helps track:

* CPU usage
* RAM usage
* Disk usage
* Network traffic
* Server health
* Application uptime

---

# Step 14 — Install Node Exporter

Node Exporter exposes Linux system metrics.

SSH into App Server:

```bash
ssh -i key.pem ubuntu@<app-public-ip>
```

---

## Run Node Exporter

```bash
docker run -d \
  --name=node-exporter \
  -p 9100:9100 \
  prom/node-exporter
```

---

## Verify Metrics

Open:

```text
http://<app-public-ip>:9100/metrics
```

---

# Step 15 — Setup Prometheus

## Create Prometheus Directory

```bash
mkdir prometheus
cd prometheus
```

---

## Create prometheus.yml

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'

    static_configs:
      - targets: ['YOUR_APP_PUBLIC_IP:9100']
```

---

## Run Prometheus

```bash
docker run -d \
  --name prometheus \
  -p 9090:9090 \
  -v $(pwd)/prometheus.yml:/etc/prometheus/prometheus.yml \
  prom/prometheus
```

---

## Verify Prometheus

Open:

```text
http://<app-public-ip>:9090
```

Go to:

```text
Status → Target health
```

Verify:

```text
node-exporter → UP
```

---

# Step 16 — Setup Grafana

## Run Grafana Container

```bash
docker run -d \
  --name grafana \
  -p 3001:3000 \
  grafana/grafana
```

---

## Access Grafana

```text
http://<app-public-ip>:3001
```

---

## Default Login

```text
username: admin
password: admin
```

---

# Step 17 — Connect Grafana to Prometheus

Go to:

```text
Connections → Data Sources → Add data source
```

Choose:

```text
Prometheus
```

Set URL:

```text
http://<app-public-ip>:9090
```

Click:

```text
Save & Test
```

---

# Step 18 — Import Monitoring Dashboard

Go to:

```text
Dashboards → Import
```

Import dashboard ID:

```text
1860
```

Select:

```text
Prometheus datasource
```

Click:

```text
Import
```

---

# Features Implemented

* Dockerized backend application
* Infrastructure as Code using Terraform
* Automated AWS provisioning
* Jenkins CI/CD pipeline
* DockerHub integration
* Automated EC2 deployment
* Prometheus monitoring
* Grafana dashboards
* Node Exporter metrics
* Cloud infrastructure automation

---

# Monitoring Stack

| Tool          | Purpose               |
| ------------- | --------------------- |
| Node Exporter | Exposes Linux metrics |
| Prometheus    | Stores metrics        |
| Grafana       | Visualizes metrics    |

---

# Ports Used

| Port | Service             |
| ---- | ------------------- |
| 3000 | Node.js Application |
| 8080 | Jenkins             |
| 9090 | Prometheus          |
| 9100 | Node Exporter       |
| 3001 | Grafana             |

---

# Security Recommendations

For production environments:

* Restrict SSH access
* Use HTTPS
* Add Nginx reverse proxy
* Use IAM roles
* Store secrets securely
* Avoid exposing monitoring publicly

---

# Future Improvements

* Kubernetes deployment
* Redis caching
* Application-level metrics
* Docker Compose orchestration
* Loki log monitoring
* Alertmanager integration
* Nginx reverse proxy
* HTTPS with SSL
* Horizontal scaling

---

# Learning Outcomes

This project demonstrates practical understanding of:

* Backend deployment
* CI/CD pipelines
* Cloud infrastructure
* Docker containerization
* Infrastructure as Code
* Monitoring & observability
* Automated deployments
* Production-style backend systems

---

# Author

Priyanshu

Backend Developer | DevOps Enthusiast
