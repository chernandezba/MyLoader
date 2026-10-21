# Mecánica del Tomy Big Loader original

## Confirmado por la documentación consultada

- El juego original de 1977 usa **un solo chasis motorizado reversible** y tres carrocerías: pala elevadora, cargador de canal y camión volquete.
- El desvío central de tres vías envía el chasis a una rama nueva cada vez que vuelve. La combinación de las tres ramas y los dos sentidos de marcha produce seis estados básicos.
- Las pestañas inversoras de la vía cambian mecánicamente el sentido del chasis. Los botones de algunas curvas permiten repetir o saltar parte de la recogida.
- La pala recibe bolitas de la tolva y las deposita en un canal que desemboca en el muelle de carga.
- El cargador recoge bolitas del muelle, las eleva por una rampa y las vierte en la carrocería del volquete, que espera estacionada.
- El chasis toma la carrocería del volquete y realiza una maniobra de inversión antes de subir y vaciar las bolitas en la tolva. El ciclo se repite.
- El juego incluye 12 bolitas, además de vías, rampa, tolva, canal de entrega, muelle y soportes.

Fuente principal: [estudio del Big Loader de 1977, con fotografías y diagramas animados](https://www.fallinsideahole.com/collections/other%20toys/big%20loader/bigloader.html), especialmente su explicación de la secuencia de funcionamiento.

## Representación actual en MyLoader

El prototipo representa el orden general de transferencia y conserva un único chasis. Las carrocerías inactivas permanecen en sus estaciones. El tiempo de simulación es independiente de los fotogramas. Las bolitas se muestran agrupadas en el recipiente que corresponde a cada fase.

## Pendiente de comprobar y reproducir con fidelidad

- Trazado exacto, medidas y altura de cada pieza de vía. Los caminos actuales son una disposición aproximada para el prototipo.
- Los seis estados del desvío y la maniobra completa de inversión del volquete. El prototipo usa una secuencia de fases simplificada, por lo que aún **no reproduce fielmente todos los pasos del mecanismo real**.
- Movimiento individual de las 12 bolitas al abrir la compuerta, rodar por el canal y subir por la rampa. Ahora cambian de recipiente por fases; falta animar físicamente cada transición.
- Forma y articulación exactas de las tres carrocerías, las guías, la tolva y los inversores.
- Efectos mecánicos de los botones de inversión de las curvas.

No debe darse por resuelta la fidelidad mecánica hasta contrastar estas piezas y movimientos con el material visual y el manual del juguete original.
