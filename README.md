# Glamor Sutil — SPA de Cosmética Minimalista

Glamor Sutil es una tienda virtual Single Page Application (SPA) premium de cosmética minimalista. Diseñada con un enfoque estético depurado de alta gama y libre de crueldad animal, ofrece una experiencia de usuario rápida, fluida y moderna.

## 🌸 Características Clave

*   ✨ **Diseño Premium**: Interfaz minimalista de alta calidad que utiliza tipografías sofisticadas (`Outfit` y `Playfair Display`), layouts limpios y efectos dinámicos de *glassmorphism*.
*   📱 **100% Responsivo**: Diseño optimizado y auto-adaptable que organiza los contenidos en rejillas estéticas o en una sola columna según el dispositivo de navegación.
*   ⚡ **Single Page Application (SPA)**: Navegación instantánea mediante control de hashes (`#home`, `#editorial`, `#collections`, `#about`) sin recargas de página.
*   🛍️ **Carrito de compras local**: Gestión persistente en el navegador utilizando `localStorage`, con contador dinámico y animaciones de rebote.
*   🔍 **Modal de Detalle de Producto**: Ventana emergente interactiva que carga imágenes o videos en alta resolución, descripciones detalladas y permite añadir productos al carrito o pedirlos por DM.
*   💬 **Checkout por WhatsApp**: Opciones de pedido directo para el carrito completo o de manera individual para cada producto a través del chat de WhatsApp.
*   🗄️ **Integración con Supabase**: Base de datos opcional para cargar productos y categorías dinámicamente con políticas de seguridad de fila (RLS) estrictas para proteger los datos.

## 🛠️ Tecnologías Utilizadas

*   **Frontend**: HTML5 y JavaScript Vanilla.
*   **Estilos**: CSS3 moderno con variables y CSS Grid/Flexbox.
*   **Base de Datos**: [Supabase](https://supabase.com/) (opcional, con fallback local).
*   **Checkout**: API de WhatsApp.

## 🚀 Instalación y Uso Local

Para levantar el proyecto en tu entorno local de forma sencilla, puedes seguir estos pasos:

1.  **Clona el repositorio**:
    ```bash
    git clone https://github.com/speed205-ctrl/glamor-sutil-spa.git
    cd glamor-sutil-spa
    ```

2.  **Inicia un servidor local**:
    Puedes usar Python para servir la carpeta localmente:
    ```bash
    python -m http.server 8080 --bind 127.0.0.1
    ```

3.  **Abre en el navegador**:
    Visita [http://127.0.0.1:8080](http://127.0.0.1:8080) para interactuar con la web.

## 🔒 Configuración de la Base de Datos (Opcional)

Si deseas conectar el sitio con Supabase:
1. Aplica el esquema del archivo `setup.sql` en tu proyecto de Supabase.
2. Ingresa a la interfaz de administración del sitio (`admin.html`) para registrar tu URL y clave pública anónima de Supabase. Estos datos se guardarán de forma segura en el `localStorage` de tu navegador.
