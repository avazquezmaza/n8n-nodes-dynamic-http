# 🚀 Inicio Rápido: Publicar en GitHub e Instalar

## Paso 1: Subir a GitHub

```bash
cd /home/avazquez/PRS/IA-Test/N8N/n8n-nodes-dynamic-http

# 1. Inicializar git (si no está inicializado)
git init

# 2. Crear .gitignore si no existe
cat > .gitignore << EOF
node_modules/
dist/
*.log
.DS_Store
.env
EOF

# 3. Agregar archivos
git add .

# 4. Commit inicial
git commit -m "Initial commit: n8n dynamic http node with credentials"

# 5. Crear repositorio en GitHub (ve a github.com y crea uno nuevo)
#    Luego ejecuta:
git remote add origin https://github.com/TU-USUARIO/n8n-nodes-dynamic-http.git
git branch -M main
git push -u origin main
```

## Paso 2: Actualizar package.json

Actualiza la URL del repositorio en `package.json`:

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/TU-USUARIO/n8n-nodes-dynamic-http.git"
  }
}
```

## Paso 3: Instalar en n8n (Docker)

```bash
# Entrar al contenedor n8n
docker exec -it n8n bash

# Instalar desde GitHub
npm install git+https://github.com/TU-USUARIO/n8n-nodes-dynamic-http.git

# Salir del contenedor
exit

# Reiniciar n8n
docker restart n8n
```

## Paso 4: Instalar en n8n (Local/Sin Docker)

```bash
# Ir al directorio de n8n
cd /ruta/a/tu/n8n

# Instalar desde GitHub
npm install git+https://github.com/TU-USUARIO/n8n-nodes-dynamic-http.git

# Reiniciar n8n (depende de cómo lo ejecutes)
# Si es servicio: sudo systemctl restart n8n
# Si es proceso: reiniciar manualmente
```

## ✅ Verificar Instalación

1. Abre n8n en el navegador
2. Ve a crear un nuevo workflow
3. Busca "Dynamic HTTP" en los nodos
4. Debería aparecer "Dynamic HTTP With Credentials"

## 🔄 Actualizar el Node

Cuando hagas cambios y los subas a GitHub:

```bash
# En el contenedor n8n o servidor
npm install git+https://github.com/TU-USUARIO/n8n-nodes-dynamic-http.git --force
# Reiniciar n8n
```

## 📝 Notas Importantes

- **No subas `node_modules/`** - Agrega a `.gitignore`
- **No subas `dist/`** si quieres que se compile en instalación (o sí, si prefieres pre-compilado)
- **El build se hace automáticamente** con `prepublishOnly` cuando instalas desde npm
- **Desde GitHub**, npm instalará y ejecutará `npm install` que compilará automáticamente

