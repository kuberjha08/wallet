# 💳 Wallet Backend + Admin Panel Deployment Guide

This project contains:

- ✅ Spring Boot Backend (JWT + SQL Server)
- ✅ Microsoft SQL Server (Docker)
- ✅ React (Vite) Admin Panel
- ✅ Nginx Reverse Proxy
- ✅ AWS EC2 Deployment

This guide explains:

- Local setup
- EC2 deployment
- Common issues & fixes
- CORS troubleshooting
- Port conflicts
- SQL login issues

---

# 🚀 1️⃣ LOCAL DEVELOPMENT SETUP

## 🧩 Backend (Spring Boot)

### Requirements

- Java 17+
- Maven
- Docker
- SQL Server container

### Start SQL Server (Docker)

```bash
docker run -e "ACCEPT_EULA=Y" \
-e "SA_PASSWORD=YourStrongPass@123" \
-p 1433:1433 \
--name sqlserver \
-d mcr.microsoft.com/mssql/server:2022-latest
```

### application.properties

```properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=wallet_db;encrypt=false
spring.datasource.username=sa
spring.datasource.password=YourStrongPass@123
spring.jpa.hibernate.ddl-auto=update
server.port=8080
```

### Run backend

```bash
mvn clean package -DskipTests
java -jar target/wallet-backend-0.0.1-SNAPSHOT.jar
```

Backend runs at:

```
http://localhost:8080
```

---

## 💻 Frontend (React + Vite)

Install dependencies:

```bash
npm install
```

Update API base URL:

```js
const API_BASE = "http://localhost:8080";
```

Run dev:

```bash
npm run dev
```

---

# ☁️ 2️⃣ AWS EC2 DEPLOYMENT GUIDE

## Step 1: Create EC2

- Amazon Linux 2023
- Open ports:
  - 22 (SSH)
  - 80 (HTTP)
  - 8080 (optional testing)
  - 1433 (only if external DB access required)

---

## Step 2: SSH Login

```bash
ssh -i wallet-key.pem ec2-user@YOUR_PUBLIC_IP
```

---

## Step 3: Install Java

```bash
sudo dnf install java-17-amazon-corretto -y
```

Verify:

```bash
java -version
```

---

## Step 4: Install Docker

```bash
sudo dnf install docker -y
sudo systemctl start docker
sudo systemctl enable docker
```

---

## Step 5: Run SQL Server in Docker

```bash
docker run -e "ACCEPT_EULA=Y" \
-e "SA_PASSWORD=YourStrongPass@123" \
-p 1433:1433 \
--name sqlserver \
-d mcr.microsoft.com/mssql/server:2022-latest
```

---

## Step 6: Upload Backend JAR

From local machine:

```bash
scp -i wallet-key.pem target/wallet-backend-0.0.1-SNAPSHOT.jar \
ec2-user@YOUR_PUBLIC_IP:~/backend/app.jar
```

---

## Step 7: Start Backend

```bash
cd ~/backend
nohup java -jar app.jar > app.log 2>&1 &
```

Check running:

```bash
ps aux | grep '[a]pp.jar'
```

Check port:

```bash
ss -tulnp | grep 8080
```

---

## Step 8: Install Nginx

```bash
sudo dnf install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

---

## Step 9: Configure Nginx Reverse Proxy

Edit:

```bash
sudo nano /etc/nginx/conf.d/default.conf
```

Paste:

```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Restart nginx:

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## Step 10: Deploy Frontend Build

On local:

```bash
npm run build
```

Upload:

```bash
scp -i wallet-key.pem -r dist/* \
ec2-user@YOUR_PUBLIC_IP:/usr/share/nginx/html/
```

Frontend runs at:

```
http://YOUR_PUBLIC_IP
```

API calls must use:

```
/api/endpoint
```

---

# 🔥 CORS FIX (Important)

In `SecurityConfig.java`:

```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOriginPatterns(List.of("*"));
    configuration.setAllowedMethods(List.of("*"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(false);

    UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
}
```

Also inside `JwtAuthFilter`:

```java
if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
    filterChain.doFilter(request, response);
    return;
}
```

---

# 🛠 COMMON ERRORS & FIXES

---

## ❌ Port 8080 already in use

```
Web server failed to start. Port 8080 was already in use.
```

Fix:

```bash
pkill -f app.jar
```

---

## ❌ Login failed for user 'sa'

Check SQL password in:

```
application.properties
```

Make sure it matches Docker password.

---

## ❌ CORS error in browser

1. Check OPTIONS request returns 200
2. Check response header:

```
Access-Control-Allow-Origin
```

3. Make sure frontend origin matches CORS config

---

## ❌ 403 in Postman

Check:

- JWT token sent?
- Endpoint requires ADMIN role?
- `/api/` prefix issue?

---

## ❌ Backend not starting

Check logs:

```bash
tail -f app.log
```

---

# 🔐 PRODUCTION RECOMMENDATIONS

- Use HTTPS (Let's Encrypt)
- Use environment variables for DB password
- Disable wildcard CORS in production
- Use systemd service instead of nohup
- Enable firewall rules

---

# 📦 Future Improvements

- Docker-compose for full stack
- CI/CD deployment
- Domain + SSL
- Separate staging & production servers

---

# 👨‍💻 Author

Wallet Backend Deployment Guide  
Spring Boot + SQL Server + React + Nginx + AWS EC2
