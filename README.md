# MyLoader

Prototipo 3D local inspirado en el Tomy Big Loader clásico de 1977.

## Ejecutar

Abre `index.html` con doble clic en Firefox, Safari o Chrome. No requiere servidor, conexión, instalación ni npm. `three.min.js` está incluido en esta carpeta (Three.js r149, licencia MIT).

## Controles

- Arrastrar: girar la cámara.
- Rueda: acercar o alejar.
- Botón derecho y arrastrar, o Mayús y arrastrar: desplazar la cámara.
- Iniciar/Pausar, Reiniciar, selector de velocidad, Restaurar cámara y Sonido.

## Estado

Este es un **primer prototipo**. Muestra un chasis, tres carrocerías intercambiables, estaciones, vías, doce bolitas y un ciclo automático con una secuencia general basada en el juguete. El trazado y varias transiciones de bolitas y carrocerías todavía son aproximados. Consulta `MECHANICS.md` antes de ampliar la simulación.

## Archivos

- `index.html`: interfaz y carga de recursos locales.
- `style.css`: presentación.
- `sim.js`: escena, geometría, reloj, ciclo y controles.
- `three.min.js`: biblioteca Three.js distribuida localmente.
- `MECHANICS.md`: investigación y asuntos pendientes.
