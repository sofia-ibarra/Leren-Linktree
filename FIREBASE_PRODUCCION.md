# 🔥 Configuración de Firebase para Producción

Guía paso a paso para configurar Firebase Firestore en tu proyecto Leren Linktree para producción.

## 📋 Paso 1: Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en **"Agregar proyecto"** o **"Crear un proyecto"**
3. Nombre del proyecto: `leren-linktree` (o el que prefieras)
4. **Desactiva** Google Analytics (no es necesario para este proyecto)
5. Click en **"Crear proyecto"**
6. Espera a que se cree (30-60 segundos)

## 📋 Paso 2: Habilitar Firestore Database

1. En el menú lateral izquierdo, busca **"Firestore Database"**
2. Click en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (lo cambiaremos después)
4. Elige una ubicación cercana a tus usuarios:
   - **Recomendado**: `us-central` (Estados Unidos)
   - O `southamerica-east1` (Brasil, más cerca de Argentina)
5. Click en **"Habilitar"**
6. Espera a que se cree (1-2 minutos)

## 📋 Paso 3: Configurar Reglas de Seguridad (IMPORTANTE)

1. En Firestore Database, ve a la pestaña **"Reglas"**
2. Reemplaza el contenido con estas reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Colección de configuración de botones
    match /config/buttons {
      // Permitir lectura a todos (público)
      allow read: if true;
      
      // Permitir escritura a todos (temporalmente)
      // ⚠️ En producción real, deberías usar Firebase Authentication
      // Por ahora, la contraseña del panel admin es la protección
      allow write: if true;
    }
  }
}
```

3. Click en **"Publicar"**

**⚠️ NOTA DE SEGURIDAD:**
- Estas reglas permiten que cualquiera escriba en la base de datos
- La protección principal es la contraseña del panel admin (hardcodeada)
- Para mayor seguridad en el futuro, implementa Firebase Authentication

## 📋 Paso 4: Obtener Credenciales de Firebase

1. En Firebase Console, click en el ícono **⚙️** (Configuración del proyecto)
2. Scroll hacia abajo hasta **"Tus aplicaciones"**
3. Click en el ícono **`</>`** (Web - Add app)
4. Registra la app:
   - **Nickname**: `Leren Linktree Web`
   - **NO marques** "También configurar Firebase Hosting"
5. Click en **"Registrar app"**

## 📋 Paso 5: Copiar la Configuración

Verás un código como este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "leren-linktree.firebaseapp.com",
  projectId: "leren-linktree",
  storageBucket: "leren-linktree.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## 📋 Paso 6: Pegar en tu Código

1. Abre el archivo **`firebase-config.js`** en tu proyecto
2. Reemplaza los valores `TU_API_KEY`, `TU_PROJECT_ID`, etc. con los valores reales
3. **Guarda el archivo**

Ejemplo de cómo debería quedar:

```javascript
window.firebaseConfig = {
    apiKey: "AIzaSyC9X8mN2pQrS5tUvWxYz1234567890",
    authDomain: "leren-linktree.firebaseapp.com",
    projectId: "leren-linktree",
    storageBucket: "leren-linktree.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:abcdef1234567890abcdef"
};
```

## 📋 Paso 7: Probar Localmente

1. Abre `index.html` en tu navegador
2. Abre la consola (F12)
3. Deberías ver: `✅ Firebase conectado`
4. Si ves `ℹ️ Firebase no configurado`, revisa que hayas guardado `firebase-config.js` correctamente

## 📋 Paso 8: Migrar Datos Iniciales

Si ya tienes botones en `data.json`:

1. Abre el panel de administración (doble click en el logo)
2. Ingresa la contraseña
3. Los botones de `data.json` se migrarán automáticamente a Firebase la primera vez
4. O puedes agregarlos manualmente desde el panel

## 📋 Paso 9: Desplegar en Vercel

### Opción A: Desde GitHub (Recomendado)

1. Sube tu código a GitHub (asegúrate de que `firebase-config.js` esté incluido)
2. Ve a [Vercel](https://vercel.com/)
3. Click en **"Add New Project"**
4. Conecta tu repositorio de GitHub
5. Selecciona el proyecto
6. Click en **"Deploy"**
7. ¡Listo! Tu sitio estará en producción

### Opción B: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# En la carpeta de tu proyecto
vercel

# Seguir las instrucciones
```

## 🔒 Seguridad Adicional (Opcional)

### Restringir por Dominio

Puedes modificar las reglas de Firestore para solo permitir escritura desde tu dominio:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /config/buttons {
      allow read: if true;
      // Solo permitir escritura desde tu dominio
      allow write: if request.auth != null || 
                     request.headers.origin.matches('https://tu-dominio.vercel.app');
    }
  }
}
```

### Usar Firebase Authentication (Más Seguro)

Para mayor seguridad, implementa Firebase Authentication:

1. En Firebase Console, ve a **Authentication**
2. Habilita **Email/Password** o **Google**
3. Modifica el código para autenticar al admin antes de permitir ediciones

## 🧪 Probar en Producción

1. Despliega en Vercel
2. Abre tu sitio en dos navegadores diferentes (o en tu celular y computadora)
3. En uno, entra como admin y agrega/edita un botón
4. En el otro, deberías ver el cambio automáticamente (sin recargar)

## 🆘 Solución de Problemas

### "Firebase no está definido"
- Verifica que `firebase-config.js` esté en la raíz del proyecto
- Asegúrate de que los valores no sean `TU_API_KEY` (deben ser los reales)
- Revisa la consola del navegador (F12) para ver errores

### "Permiso denegado"
- Revisa las reglas de Firestore
- Asegúrate de que las reglas permitan lectura y escritura
- Verifica que Firestore esté habilitado en tu proyecto

### Los cambios no se sincronizan
- Verifica la consola del navegador (F12)
- Asegúrate de que Firebase esté conectado (`✅ Firebase conectado`)
- Revisa que Firestore tenga datos (ve a Firebase Console > Firestore Database)

### Error en Vercel
- Asegúrate de que `firebase-config.js` esté en el repositorio
- Verifica que el archivo tenga la extensión `.js` correcta
- Revisa los logs de Vercel para ver errores específicos

## 📝 Checklist Final

- [ ] Proyecto creado en Firebase
- [ ] Firestore habilitado
- [ ] Reglas de seguridad configuradas
- [ ] Credenciales copiadas en `firebase-config.js`
- [ ] Probado localmente
- [ ] Desplegado en Vercel
- [ ] Probado en producción (dos navegadores)

## 💰 Costos

Firebase tiene un **plan gratuito generoso**:
- ✅ 50,000 lecturas/día
- ✅ 20,000 escrituras/día
- ✅ 20,000 eliminaciones/día
- ✅ 1 GB de almacenamiento

Para un linktree, esto es **más que suficiente y completamente gratis**.

---

¿Necesitas ayuda? Revisa la [documentación de Firebase](https://firebase.google.com/docs/firestore)

