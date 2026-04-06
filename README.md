# n8n-nodes-dynamic-http

Nodo personalizado de n8n para realizar peticiones HTTP con selección dinámica de credenciales por item.

## Características

- ✅ Selección dinámica de credenciales por item
- ✅ Soporte para múltiples métodos HTTP (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
- ✅ Caché de credenciales con TTL para optimización
- ✅ Reintentos con backoff exponencial
- ✅ Logging sanitizado (no expone credenciales)
- ✅ Validación SSRF (bloquea URLs maliciosas)
- ✅ Validación de entrada (nombres, tamaños, formatos)
- ✅ Límites de seguridad (body máximo 10MB, timeout máximo 10 minutos)

## Instalación

```bash
npm install
npm run build
```

## Uso

Ver documentación en `QUICK-START.md`

### Ejemplo Básico

```json
{
  "credentialName": "{{ $json.credentialName }}",
  "url": "{{ $json.url }}",
  "method": "GET"
}
```

Cada item puede usar una credencial diferente especificada en `credentialName`.

## Seguridad

### Correcciones Implementadas

- ✅ **Validación SSRF**: Bloquea localhost, IPs privadas, metadatos cloud
- ✅ **Validación de Entrada**: Nombres de credenciales validados (formato y longitud)
- ✅ **Límites de Seguridad**: Body máximo 10MB, timeout máximo 10 minutos
- ✅ **Sanitización de Logs**: Credenciales, tokens y passwords enmascarados
- ✅ **Dependencias Actualizadas**: Gulp actualizado a versión segura

### Validación

Para validar que las correcciones funcionan:

```bash
# Tests automáticos
node scripts/test-security-fixes.js

# Verificación de dependencias
npm audit
```

### Notas de Seguridad

- El nodo modifica el estado interno de n8n para cambiar credenciales dinámicamente (requerido para la funcionalidad)
- Se recomienda usar solo en entornos confiables
- Las credenciales se cachean en memoria durante la ejecución (TTL: 2 minutos)

## Desarrollo

```bash
# Desarrollo con watch
npm run dev

# Build
npm run build

# Lint
npm run lint
npm run lintfix
```

## Licencia

MIT
