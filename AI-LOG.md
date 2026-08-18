# AI Log — HW05 JavaScript Fundamentals

## Herramienta utilizada

Se utilizó Codex (OpenAI) como apoyo para planear, implementar y revisar la interactividad del prototipo académico ConectaNegocio.

## Prompt utilizado

> Basado en el documento maestro del proyecto ConectaNegocio, el diseño existente en Figma y la rúbrica de HW05, crea una página de ofertas con JavaScript puro. Debe incluir un filtro en tiempo real sobre al menos cinco elementos, un formulario completamente validado con mensajes visibles, dos o más comportamientos interactivos, un atajo de teclado no obvio, manipulación del DOM mediante `addEventListener`, cero manejadores inline y cero librerías. Separa la lógica principal en `js/main.js` y la validación en `js/validation.js`. Usa datos ficticios y acláralo visiblemente.

## Resultado inicial propuesto por la IA

La propuesta inicial consistía en:

- Una lista estática de productos filtrada solamente por nombre.
- Un formulario de solicitud con validación de campos obligatorios al enviarlo.
- El atajo `Ctrl+K` para enfocar la búsqueda.
- Un mensaje general de éxito después del envío.

Fragmento representativo de la primera propuesta:

```js
searchInput.addEventListener("input", () => {
  const term = searchInput.value.toLowerCase();
  products.forEach((product) => {
    product.hidden = !product.textContent.toLowerCase().includes(term);
  });
});
```

## Parte que no se entendió inmediatamente

La normalización con `String.prototype.normalize("NFD")` y la expresión `/[\u0300-\u036f]/g` necesitó revisión. Su propósito es retirar los signos diacríticos temporalmente para que una búsqueda como “papeleria” también encuentre “papelería”, sin cambiar el texto que ve el usuario.

## Cambios realizados después de probar

1. **Datos renderizados desde JavaScript.** En vez de filtrar nodos HTML escritos manualmente, las ofertas se almacenaron como objetos y la tabla se vuelve a generar. Esto permite ordenar y combinar filtros sin duplicar lógica.
2. **Búsqueda más flexible.** El filtro final revisa producto, descripción, proveedor, ciudad y categoría, además de ignorar mayúsculas y tildes.
3. **Filtros combinados.** Se agregaron categoría, disponibilidad y orden por precio o entrega.
4. **Validación modular.** Las reglas se movieron a `js/validation.js`, mientras que `js/main.js` se limita a mostrar errores y responder a eventos.
5. **Validación progresiva.** Los mensajes aparecen al salir de cada campo y se actualizan mientras el usuario corrige el valor; no se usan ventanas `alert()`.
6. **Respuesta visible del DOM.** Al guardar una solicitud ficticia se agrega una actividad al inicio de la lista y aparece una notificación temporal.
7. **Accesibilidad.** Se añadieron regiones `aria-live`, asociación entre errores y campos, control de foco y cierre con `Escape`.
8. **Diseño adaptable.** Se agregó un menú móvil que se abre y cierra usando `addEventListener`.

## Diferencia principal entre la propuesta y la versión final

El fragmento inicial alternaba la propiedad `hidden` de elementos ya existentes. La versión final filtra un arreglo de datos y ejecuta `renderOffers()`, lo que mantiene sincronizados la tabla, el contador de resultados y el estado vacío. También permite aplicar simultáneamente búsqueda, categoría, disponibilidad y ordenamiento.

## Declaración sobre los datos

Todos los nombres de personas, comercios, proveedores, productos, cantidades, precios y actividades incluidos en el prototipo son ficticios y se utilizan únicamente con fines educativos.
