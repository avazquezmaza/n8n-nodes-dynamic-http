# Guía para Publicar e Instalar n8n-nodes-dynamic-http

## 📦 Opciones de Publicación

### **Opción 1: Publicar en npm (Recomendado para uso público)**

#### Requisitos:
- Cuenta en [npmjs.com](https://www.npmjs.com/signup)
- Nombre único del paquete (verificar disponibilidad)

#### Pasos:

1. **Actualizar `package.json`** con tu información:
```json
{
  "name": "@tu-usuario/n8n-nodes-dynamic-http",  // o solo "n8n-nodes-dynamic-http" si está disponible
  "version": "1.0.0",
  "description": "n8n community node for dynamic HTTP requests with credential selection per item",
  "author": {
    "name": "Tu Nombre",
    "email": "tu.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/tu-usuario/n8n-nodes-dynamic-http.git"
  }
}
```

2. **Iniciar sesión en npm**:
```bash
cd n8n-nodes-dynamic-http
npm login
```

3. **Compilar el proyecto**:
```bash
npm run build
```

4. **Publicar**:
```bash
npm publish
# Si usas scope (@tu-usuario/...), usar:
npm publish --access public
```

5. **Instalar en n8n**:
```bash
# En tu servidor n8n
npm install @tu-usuario/n8n-nodes-dynamic-http
# Reiniciar n8n
```

---

### **Opción 2: GitHub + npm install (Recomendado para privado o desarrollo)**

#### Ventajas:
- ✅ No requiere cuenta npm
- ✅ Control de versiones con Git
- ✅ Puede ser privado
- ✅ Fácil de actualizar

#### Pasos:

1. **Subir a GitHub**:
```bash
cd n8n-nodes-dynamic-http

# Inicializar git si no está inicializado
git init
git add .
git commit -m "Initial commit: n8n dynamic http node"

# Crear repositorio en GitHub y luego:
git remote add origin https://github.com/tu-usuario/n8n-nodes-dynamic-http.git
git branch -M main
git push -u origin main
```

2. **Actualizar `package.json`** con la URL de GitHub:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/tu-usuario/n8n-nodes-dynamic-http.git"
  }
}
```

3. **Instalar desde GitHub en n8n**:
```bash
# En tu servidor n8n (Docker o local)
npm install git+https://github.com/tu-usuario/n8n-nodes-dynamic-http.git

# O con SSH (si tienes acceso):
npm install git+ssh://git@github.com/tu-usuario/n8n-nodes-dynamic-http.git

# O desde una rama específica:
npm install git+https://github.com/tu-usuario/n8n-nodes-dynamic-http.git#main

# Reiniciar n8n
```

4. **Para actualizar**:
```bash
npm install git+https://github.com/tu-usuario/n8n-nodes-dynamic-http.git --force
# Reiniciar n8n
```

---

### **Opción 3: Instalación Local (Para desarrollo)**

#### Usar cuando:
- Estás desarrollando y probando
- No quieres publicar aún
- Trabajas en la misma máquina

#### Pasos:

1. **Compilar el proyecto**:
```bash
cd n8n-nodes-dynamic-http
npm run build
```

2. **Instalar localmente en n8n**:
```bash
# Opción A: Desde el directorio (ruta relativa)
cd /ruta/a/tu/n8n
npm install /home/avazquez/PRS/IA-Test/N8N/n8n-nodes-dynamic-http

# Opción B: Usar npm link (desarrollo activo)
cd /home/avazquez/PRS/IA-Test/N8N/n8n-nodes-dynamic-http
npm link

cd /ruta/a/tu/n8n
npm link n8n-nodes-dynamic-http
```

3. **Reiniciar n8n**

---

### **Opción 4: Docker - Montar como volumen (Para desarrollo)**

Si usas Docker Compose:

```yaml
# docker-compose.yml
services:
  n8n:
    volumes:
      - ./n8n-nodes-dynamic-http:/home/node/.n8n/custom/n8n-nodes-dynamic-http
    environment:
      - N8N_COMMUNITY_PACKAGES_PATH=/home/node/.n8n/custom
```

Luego dentro del contenedor:
```bash
docker exec -it n8n bash
cd /home/node/.n8n/custom/n8n-nodes-dynamic-http
npm install
npm run build
# Reiniciar n8n
```

---

## 🔧 Configuración en n8n

### **Después de instalar el paquete:**

1. **Reiniciar n8n** (si no se reinició automáticamente)

2. **Verificar instalación**:
   - Abre n8n en el navegador
   - Ve a "Nodes" en el menú lateral
   - Busca "Dynamic HTTP" o "DynamicHttpWithCredentials"
   - Debería aparecer en la lista de nodos disponibles

3. **Si no aparece**:
   - Verifica que el build se completó: `ls dist/nodes/DynamicHttpWithCredentials/`
   - Verifica logs de n8n: `docker logs n8n` o logs del proceso
   - Verifica que `package.json` tiene la sección `n8n` correcta

---

## 📝 Checklist antes de publicar

- [ ] Actualizar `package.json` con tu información real
- [ ] Actualizar `version` en `package.json` (usar semver: 1.0.0, 1.0.1, etc.)
- [ ] Compilar: `npm run build`
- [ ] Verificar que `dist/` contiene los archivos compilados
- [ ] Probar localmente antes de publicar
- [ ] Crear README.md con documentación
- [ ] Agregar `.npmignore` si es necesario (opcional)

---

## 🚀 Comandos Útiles

```bash
# Compilar
npm run build

# Verificar estructura de dist/
ls -la dist/nodes/DynamicHttpWithCredentials/

# Limpiar y recompilar
rm -rf dist node_modules
npm install
npm run build

# Verificar package.json
npm pack --dry-run

# Publicar versión específica
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0
npm publish
```

---

## 🔐 Para Repositorios Privados

Si tu repositorio es privado en GitHub:

1. **Usar token de acceso personal**:
```bash
npm install git+https://TU_TOKEN@github.com/tu-usuario/n8n-nodes-dynamic-http.git
```

2. **O configurar en `.npmrc`**:
```
//registry.npmjs.org/:_authToken=TU_NPM_TOKEN
@tu-usuario:registry=https://npm.pkg.github.com
```

---

## 📚 Referencias

- [n8n Community Nodes Documentation](https://docs.n8n.io/integrations/community-nodes/)
- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [GitHub Packages](https://docs.github.com/en/packages)

---

## 💡 Recomendación

**Para uso interno/privado**: Usa **Opción 2 (GitHub + npm install)**
- Más flexible
- Control de versiones
- Fácil de actualizar
- No requiere cuenta npm pública

**Para uso público/compartir**: Usa **Opción 1 (npm)**
- Más fácil de instalar para otros
- Aparece en búsquedas de npm
- Versionado automático

