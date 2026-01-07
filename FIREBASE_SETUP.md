# 🔥 Configuración de Firebase

Este proyecto usa Firebase Firestore para sincronizar los botones entre todos los usuarios. Cuando el admin hace cambios, se actualizan para todos automáticamente.

## 📋 Pasos para configurar Firebase

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Click en **"Agregar proyecto"** o **"Crear un proyecto"**
3. Ingresa un nombre para tu proyecto (ej: "leren-linktree")
4. Desactiva Google Analytics (opcional, no es necesario)
5. Click en **"Crear proyecto"**

### 2. Habilitar Firestore

1. En el menú lateral, ve a **"Firestore Database"**
2. Click en **"Crear base de datos"**
3. Selecciona **"Comenzar en modo de prueba"** (para desarrollo)
4. Elige una ubicación (ej: `us-central`)
5. Click en **"Habilitar"**

### 3. Configurar reglas de seguridad

1. Ve a la pestaña **"Reglas"** en Firestore
2. Reemplaza las reglas con estas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura a todos
    match /config/buttons {
      allow read: if true;
      // Solo permitir escritura con contraseña (esto es básico, para producción usa Authentication)
      allow write: if true; // ⚠️ En producción, cambia esto por autenticación real
    }
  }
}
```

**⚠️ IMPORTANTE:** Las reglas actuales permiten que cualquiera escriba. Para producción, deberías usar Firebase Authentication.

### 4. Obtener las credenciales

1. En Firebase Console, ve a **⚙️ Configuración del proyecto** (ícono de engranaje)
2. Scroll hacia abajo hasta **"Tus aplicaciones"**
3. Click en el ícono **`</>`** (Web)
4. Registra la app con un nombre (ej: "Leren Linktree Web")
5. **NO marques** "También configurar Firebase Hosting"
6. Click en **"Registrar app"**

### 5. Copiar la configuración

Verás algo como esto:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

### 6. Pegar en tu código

1. Abre `index.html`
2. Busca la sección que dice `// Tu configuración de Firebase`
3. Reemplaza los valores `TU_API_KEY`, `TU_PROJECT_ID`, etc. con los valores reales de tu proyecto

Ejemplo:

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

### 7. ¡Listo! 🎉

Ahora tu proyecto está conectado a Firebase. Los cambios del admin se sincronizarán automáticamente para todos los usuarios.

## 🔒 Seguridad (Opcional pero Recomendado)

Para mayor seguridad, puedes:

1. **Usar Firebase Authentication**: Requiere que el admin se autentique antes de editar
2. **Configurar reglas más estrictas**: Solo permitir escritura desde tu dominio
3. **Usar Cloud Functions**: Validar cambios en el servidor

Para proyectos pequeños, las reglas actuales son suficientes, pero ten en cuenta que cualquiera que vea el código puede escribir en la base de datos.

## 🆘 Solución de problemas

### "Firebase no está definido"
- Verifica que hayas copiado correctamente la configuración
- Asegúrate de que los scripts de Firebase se carguen antes de `script.js`

### "Permiso denegado"
- Revisa las reglas de Firestore
- Asegúrate de que las reglas permitan lectura y escritura

### Los cambios no se sincronizan
- Verifica la consola del navegador (F12) para ver errores
- Asegúrate de que Firestore esté habilitado en tu proyecto

## 💰 Costos

Firebase tiene un plan **gratuito generoso**:
- 50,000 lecturas/día
- 20,000 escrituras/día
- 20,000 eliminaciones/día

Para un linktree personal, esto es más que suficiente y es **completamente gratis**.

---

¿Necesitas ayuda? Revisa la [documentación de Firebase](https://firebase.google.com/docs/firestore)



