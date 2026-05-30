# gym.log 💪

App de registro de entrenamientos con React + Firebase.

## Configuración Firebase

Los archivos ya tienen tu configuración de Firebase incluida.

Antes de subir a Vercel, configura las reglas de seguridad en Firestore:
Ve a Firebase Console → Firestore → Reglas y pega esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Subir a Vercel

1. Instala Git si no lo tienes: https://git-scm.com
2. Crea cuenta en https://vercel.com con Google
3. Instala Vercel CLI: `npm install -g vercel`
4. En la carpeta del proyecto ejecuta: `vercel`
5. Sigue los pasos (acepta todo por defecto)
6. ¡Listo! Te dará una URL pública

## Desarrollo local

```bash
npm install
npm start
```
