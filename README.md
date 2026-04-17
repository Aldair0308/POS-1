Diseña una aplicación móvil completa para gestión de restaurantes en México con enfoque profesional, moderno y altamente funcional. La app será usada todo el día por meseros, cocina, barra y administradores, por lo que debe priorizar comodidad visual, velocidad y claridad.

🎨 ESTILO GENERAL:

* Modo oscuro obligatorio (NO fondos blancos)
* Paleta: negros suaves (#0F0F0F), grises oscuros, acentos en naranja/ámbar (#FF8C00) o verde lima
* Tipografía moderna y legible (tipo Inter / SF Pro)
* UI tipo app moderna similar a DiDi Food
* Bordes redondeados (12px–20px)
* Botones grandes y táctiles
* Diseño limpio, sin saturación

🇲🇽 CONTEXTO:

* Español mexicano natural (ej: “Mesa”, “Cuenta”, “Pedido”, “Listo”, “Cobrar”)
* Uso intensivo en restaurantes reales
* Flujo rápido (mínimos pasos)

---

# 🧠 CONCEPTO CLAVE DEL SISTEMA (MUY IMPORTANTE)

Cada producto tiene:

1. CONFIGURACIONES (grupos)
   Ejemplo:

   * Ingredientes
   * Extras
   * Escarchado (para bebidas)

2. OPCIONES dentro de cada configuración
   Ejemplo:

   * Ingredientes: queso, jitomate, cebolla
   * Escarchado: sal, chile, limón

3. CONFIGURACIÓN POR DEFAULT (CLAVE UX)

   * Cada producto YA viene preconfigurado automáticamente
   * Representa cómo normalmente se pide ese producto
   * El usuario solo ajusta si lo necesita

👉 Esto debe reflejarse VISUALMENTE en la UI

---

# 👑 ADMINISTRADOR (MUY IMPORTANTE ESTA PARTE)

Diseñar pantallas para:

## 📦 CREAR / EDITAR PRODUCTO

Sección completa con:

* Nombre
* Imagen
* Precio
* Tipo:

  * Cocina
  * Bebida

---

## ⚙️ CONFIGURACIÓN DE PRODUCTO (CORE)

Diseñar una interfaz clara para:

### 1. Crear configuraciones (grupos)

Ej:

* Ingredientes
* Extras
* Escarchado (solo bebidas)

Botón: “Agregar configuración”

---

### 2. Dentro de cada configuración:

Lista de opciones:

Ejemplo:
[ ] Queso
[ ] Tocino
[ ] Aguacate

* Cada opción puede tener precio extra

---

### 3. SELECCIÓN POR DEFAULT (🔥 CLAVE)

Esto es MUY IMPORTANTE:

* Cada opción debe tener un estado:
  ✅ Seleccionado por defecto
  ⬜ No seleccionado

Visualmente:

* Toggle / checkbox activo
* Debe verse clarísimo qué viene por default

Ejemplo UI:
Queso        [✓ default]
Tocino       [ ]
Aguacate     [✓ default]

---

### 4. REGLAS UX:

* Debe ser súper rápido configurar defaults
* Debe ser visual (no técnico)
* Drag & drop opcional para ordenar

---

# 👨‍🍳 MESERO (AFECTADO POR DEFAULTS)

## 🍔 MODAL DE PRODUCTO

Cuando el mesero abre un producto:

* YA VIENE PRECONFIGURADO automáticamente
* Mostrar opciones agrupadas:

Ejemplo:

Ingredientes:
☑ Queso
☑ Jitomate
☐ Cebolla

Extras:
☐ Tocino (+$20)

---

## UX:

* Cambios rápidos (tap)
* Precio actualizado en tiempo real
* Botón: “Agregar al pedido”

---

# 🍹 BARRA (IMPORTANTE)

Si es bebida:

Mostrar:

* Configuración de escarchado
* Ejemplo:

Escarchado:
☑ Sal
☐ Chile

---

# 👨‍🍳 COCINA

Mostrar claramente:

* Producto
* MODIFICACIONES vs DEFAULT

Ejemplo:

Hamburguesa
❌ Sin cebolla
➕ Extra tocino

👉 IMPORTANTE:
Mostrar solo diferencias respecto al default

---

# ⚡ UX INTELIGENTE (MUY IMPORTANTE)

* Resaltar cambios hechos por el cliente
* No repetir todo el default en cocina
* Solo mostrar:

  * lo que se quitó
  * lo que se agregó

---

# 📱 PANTALLAS A GENERAR (ACTUALIZADO)

* Login
* Dashboard admin
* CRUD productos
* ⚙️ Configuración de producto (MUY DETALLADA)
* Inventario
* POS mesero
* Modal producto con defaults
* Vista cuenta
* Cocina (productos individuales)
* Barra (órdenes completas)
* Reportes
* Usuarios

---

# 🎯 OBJETIVO FINAL

Crear una UI profesional lista para producción que:

* Reduzca el tiempo de toma de pedidos
* Minimice errores
* Sea clara para cocina/barra
* Permita configuración flexible de productos
* Use defaults inteligentes para acelerar el flujo

IMPORTANTE:

* Todo en dark mode
* Diseño consistente
* Componentes reutilizables
* Pensado como SaaS moderno
