#!/usr/bin/env node

/**
 * Script de Validación de Seguridad
 * Detecta vulnerabilidades comunes en el código
 */

const fs = require('fs');
const path = require('path');

const ISSUES = {
    CRITICAL: [],
    HIGH: [],
    MEDIUM: [],
    LOW: []
};

function addIssue(severity, file, line, message) {
    ISSUES[severity].push({
        file,
        line,
        message
    });
}

function checkSSRF(filePath, content) {
    const lines = content.split('\n');
    const urlPattern = /url\s*[:=]\s*[^,;}\n]+/gi;
    const requestPattern = /\.request\s*\(/gi;
    
    lines.forEach((line, index) => {
        if (requestPattern.test(line) || urlPattern.test(line)) {
            // Buscar si hay validación de URL antes
            const beforeLines = lines.slice(Math.max(0, index - 10), index).join('\n');
            if (!beforeLines.match(/isValidUrl|validateUrl|url\.protocol|localhost|127\.0\.0\.1|private.*ip/i)) {
                addIssue('CRITICAL', filePath, index + 1, 
                    'Posible SSRF: URL usada sin validación. Validar protocolo, hostname y bloquear IPs privadas.');
            }
        }
    });
}

function checkInternalStateManipulation(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // Detectar manipulación directa de estado interno
        if (line.match(/node\.credentials\[.*\]\.id\s*=/)) {
            addIssue('HIGH', filePath, index + 1, 
                'Manipulación de estado interno: Modificando node.credentials directamente. Usar APIs públicas de n8n.');
        }
        
        if (line.match(/delete\s+.*\.(id|name|value)/)) {
            addIssue('HIGH', filePath, index + 1, 
                'Eliminando propiedades internas: Puede causar comportamiento impredecible.');
        }
        
        if (line.match(/as\s+any|as\s+unknown/)) {
            // Verificar contexto - solo alertar si es para acceder a propiedades internas
            const context = lines.slice(Math.max(0, index - 2), index + 3).join('\n');
            if (context.match(/credentials|credentialStore|workflow\[|node\[/)) {
                addIssue('HIGH', filePath, index + 1, 
                    'Type assertion peligrosa: Accediendo a propiedades internas con type assertions.');
            }
        }
    });
}

function checkHardcodedDelays(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        if (line.match(/setTimeout\s*\(.*,\s*\d+\)/)) {
            addIssue('LOW', filePath, index + 1, 
                'Delay hardcodeado: Usar eventos o callbacks en lugar de delays fijos.');
        }
    });
}

function checkInputValidation(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // Detectar uso de parámetros sin validación
        if (line.match(/getParameter|getNodeParameter/) && 
            !lines.slice(Math.max(0, index - 5), index + 1).join('\n').match(/validate|trim|test|match/)) {
            const nextLines = lines.slice(index, Math.min(lines.length, index + 5)).join('\n');
            if (nextLines.match(/request|http|url|credential/)) {
                addIssue('MEDIUM', filePath, index + 1, 
                    'Falta validación de entrada: Parámetro usado sin validación adecuada.');
            }
        }
    });
}

function checkCredentialAccess(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        // Detectar acceso a propiedades internas para credenciales
        if (line.match(/credentialsHelper|credentialStore|__credentialManager/)) {
            addIssue('HIGH', filePath, index + 1, 
                'Acceso a propiedades internas: Usar executeFunctions.getCredentials() en su lugar.');
        }
        
        // Detectar múltiples métodos de acceso
        const context = lines.slice(Math.max(0, index - 10), Math.min(lines.length, index + 10)).join('\n');
        const methodCount = (context.match(/getDecrypted|credentialStore\.get|getCredentials/g) || []).length;
        if (methodCount > 2) {
            addIssue('HIGH', filePath, index + 1, 
                'Múltiples métodos de acceso a credenciales: Puede indicar intento de bypass de seguridad.');
        }
    });
}

function checkSharedCache(filePath, content) {
    const lines = content.split('\n');
    
    lines.forEach((line, index) => {
        if (line.match(/static.*cache|Map.*cache/i) && !line.match(/userId|workflowId|userContext/)) {
            addIssue('HIGH', filePath, index + 1, 
                'Caché compartido sin contexto de usuario: Puede permitir acceso cruzado a credenciales.');
        }
    });
}

function checkDependencies() {
    try {
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        // Lista de dependencias conocidas como vulnerables
        const vulnerableDeps = {
            'gulp': '<5.0.0',
            'braces': '<3.0.3',
            'chokidar': '<3.0.0',
            'form-data': '<4.0.4'
        };
        
        Object.keys(vulnerableDeps).forEach(dep => {
            if (deps[dep]) {
                addIssue('HIGH', 'package.json', 0, 
                    `Dependencia potencialmente vulnerable: ${dep}. Ejecutar 'npm audit' para verificar.`);
            }
        });
    } catch (e) {
        // Ignorar si no se puede leer package.json
    }
}

function scanFile(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const ext = path.extname(filePath);
        
        if (ext === '.ts' || ext === '.js') {
            checkSSRF(filePath, content);
            checkInternalStateManipulation(filePath, content);
            checkHardcodedDelays(filePath, content);
            checkInputValidation(filePath, content);
            checkCredentialAccess(filePath, content);
            checkSharedCache(filePath, content);
        }
    } catch (e) {
        console.error(`Error scanning ${filePath}: ${e.message}`);
    }
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            // Saltar node_modules y dist
            if (file !== 'node_modules' && file !== 'dist' && file !== '.git') {
                scanDirectory(filePath);
            }
        } else {
            scanFile(filePath);
        }
    });
}

// Ejecutar escaneo
console.log('🔍 Escaneando código en busca de vulnerabilidades...\n');

// Escanear directorio nodes
if (fs.existsSync('nodes')) {
    scanDirectory('nodes');
}

// Verificar dependencias
checkDependencies();

// Mostrar resultados
let totalIssues = 0;

['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].forEach(severity => {
    const issues = ISSUES[severity];
    totalIssues += issues.length;
    
    if (issues.length > 0) {
        const emoji = severity === 'CRITICAL' ? '🔴' : 
                     severity === 'HIGH' ? '🟠' : 
                     severity === 'MEDIUM' ? '🟡' : '🟢';
        
        console.log(`${emoji} ${severity}: ${issues.length} problema(s)`);
        issues.forEach(issue => {
            console.log(`   ${issue.file}:${issue.line} - ${issue.message}`);
        });
        console.log('');
    }
});

if (totalIssues === 0) {
    console.log('✅ No se encontraron problemas obvios de seguridad.');
    console.log('⚠️  Nota: Este es un escaneo básico. Se recomienda una auditoría profesional.');
} else {
    console.log(`\n📊 Total: ${totalIssues} problema(s) encontrado(s)`);
    console.log('\n📖 Ver VULNERABILITY-ANALYSIS.md para más detalles y soluciones.');
    process.exit(1);
}

