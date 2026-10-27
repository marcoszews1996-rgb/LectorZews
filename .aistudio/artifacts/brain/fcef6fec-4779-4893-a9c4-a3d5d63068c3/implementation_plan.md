# Actualización de Fondo Escénico & Resolución de Sincronización GitHub en LectorZews

Plan integral para incorporar la nueva ambientación visual (biblioteca monumental con micrófono de transmisión y muñeco de tela lector) y proporcionar la solución definitiva paso a paso para reconectar y sobrescribir el repositorio de GitHub antiguo superando el error de permisos sin perder ninguna actualización.

### User Review & Critical Decisions

> [!IMPORTANT]
> Se han integrado las preferencias confirmadas en la fase de clarificación sobre la gestión del repositorio de GitHub y la nueva directiva artística de fondo.

- **Decisión Confirmada 1 (GitHub Sync)**: El error reportado es *Error de permisos o autorización de GitHub*. Se resolvió proceder con la sobrescritura forzada controlada (`force-push` / sobreescritura limpia) hacia el repositorio antiguo para garantizar que la versión actual y todos los avances de LectorZews se mantengan como la única fuente de verdad en GitHub.
- **Decisión Confirmada 2 (Arte de Fondo)**: Generación e integración de una ilustración fotorrealista/editorial de alta fidelidad: una biblioteca gigante de estanterías infinitas de madera noble, con un micrófono de condensador estilo vintage en el centro y un entrañable muñeco de tela artesanal leyendo un libro iluminado frente al micrófono.
- **Decisión Confirmada 3 (Integridad de Audio & Lectura)**: Mantener intacta la arquitectura de reproducción en segundo plano (Web Speech API + sintetizador de audio de respaldo en bucle + MediaSession API) y los efectos ambientales (incluyendo pistas de misterio y lluvia).

---

### 1. Overview & Core Concept

- **What It Does**: 
  1. Renueva la identidad visual inmersiva de la aplicación con un fondo temático que representa el alma de la narración de libros: un muñeco de tela relatando una historia frente a un micrófono en una biblioteca colosal.
  2. Ofrece la ruta de sincronización y rescate segura para solucionar el bloqueo de permisos OAuth/credenciales de GitHub, asegurando la actualización completa del repositorio remoto.
- **Target Audience / Persona**: Lectores y usuarios de LectorZews en dispositivos móviles y web que disfrutan de la lectura asistida en segundo plano y necesitan que sus avances estén respaldados en su repositorio personal.
- **Key Value**: Atmósfera de lectura acogedora y cinematográfica combinada con la tranquilidad absoluta de respaldar y desplegar el código fuente sin fricciones de permisos.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Apertura de la App / Biblioteca*: El usuario contempla el fondo de la gran biblioteca con el muñeco de tela lector y el micrófono central. Las tarjetas de libros, opciones y botones flotan con legibilidad nítida gracias a filtros de contraste óptico adaptados tanto para modo noche como día.
  2. *Modo Inmersivo y Lectura*: Durante la reproducción, el fondo acompaña la experiencia narrativa con un sutil gradiente oscurecido para concentrarse en las frases del texto activo.
  3. *Sincronización a GitHub*: El usuario sigue las instrucciones guiadas de re-autenticación y forzado en la interfaz de AI Studio o terminal de Git para dejar su repositorio remoto 100% al día con su código.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Nostálgica, literaria y cálida. Combina la calidez de los cuentos clásicos con la estética de radioteatro o audiolibro vintage.
  - *Color Palette & Mood*:
    - Canvas y scrims: `--neutral-950` con mezclas suaves en ámbar y caoba.
    - Tipografía: Títulos en fuente serif editorial (`Cinzel`, `Playfair Display`) y cuerpo de texto limpio en `Plus Jakarta Sans`.
    - Acentos funcionales: Ámbar dorado (`#f59e0b`) para controles de reproducción e indicadores de lectura activos.
  - *Spatial Layout & Contrast*:
    - Capa de imagen con `object-cover object-center` y relación de aspecto panorámica 16:9.
    - Gradientes de lectura multietapa (`bg-gradient-to-t from-neutral-950/85 via-neutral-950/20 to-neutral-950/75`) que aseguran contraste WCAG AA en todo momento sobre el texto.

---

### 3. Key Product Decisions & Trade-Offs

- **Decisión 1: Estrategia de Solución para Permisos de GitHub**:
  - *Enfoque*: El error de permisos ocurre porque la autorización OAuth de GitHub en la interfaz caducó o el token personal no tiene asignado el ámbito `repo` (lectura/escritura) sobre repositorios privados o repositorios pertenecientes a organizaciones. Se proporcionará tanto la vía nativa mediante el panel de integración de AI Studio (desconectar y volver a autorizar con permisos de escritura) como los comandos precisos de Git en terminal para forzar la actualización al remote `origin`.
  - *Por qué*: Es la vía más robusta y definitiva; evita clonaciones fallidas y no arriesga ningún archivo local.

- **Decisión 2: Generación del Fondo con `generate_image`**:
  - *Enfoque*: Generar una imagen personalizada de alta resolución con prompt específico detallando la iluminación suave de la biblioteca, los anaqueles gigantes, el micrófono de pie central y la textura artesanal de tela y costuras del muñeco sosteniendo el libro.
  - *Por qué*: Reemplaza fondos genéricos con un arte original directamente adaptado a la identidad de marca de LectorZews y al pedido exacto del usuario.

---

### 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                       LectorZews                            │
├─────────────────────────────────────────────────────────────┤
│  [ Visual Atmosphere Layer ]                                │
│   └─ Fixed Background: Grand Library + Puppet + Vintage Mic │
│   └─ Dynamic Contrast Scrim (Dark / Light Theme Adapters)   │
├─────────────────────────────────────────────────────────────┤
│  [ Core Modules ]                                           │
│   ├─ PDF Parser & Text Extractor (pdfjsLib / UTF-8)         │
│   ├─ Speech Engine & Web Speech API TTS                     │
│   ├─ Background Audio Loop (Continuous Phone Standby)       │
│   ├─ Ambient Audio Mixer (Rain, Mystery Soundtrack, etc.)   │
│   └─ Navigator MediaSession & Wakelock API                  │
├─────────────────────────────────────────────────────────────┤
│  [ GitHub Sync Pipeline ]                                   │
│   ├─ Re-authenticate GitHub OAuth (Scope: repo, write)      │
│   ├─ Configure Remote Origin URL                            │
│   └─ Force Push Strategy (git push --force origin main)     │
└─────────────────────────────────────────────────────────────┘
```

- **State Mapping & Execution Plan**:
  1. **Generación de Imagen**: Ejecutar `generate_image` para crear el fondo exacto según la descripción del usuario.
  2. **Integración en `App.tsx`**: Importar el nuevo activo de imagen generado y enlazarlo en el contenedor de fondo con las capas de sombreado y contraste adecuadas.
  3. **Guía de Desbloqueo y Forzado en GitHub**: Presentar los pasos precisos y comandos listos para ejecutar para renovar la autorización de GitHub y forzar los cambios sobre el repositorio viejo sin ningún riesgo de pérdida.
  4. **Verificación**: Compilación con `compile_applet` y validación de cero errores de TypeScript y linting.
