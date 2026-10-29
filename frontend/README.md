# Open-Ticket Frontend

Interfaz web moderna, minimalista y responsiva para **Open-Ticket**, desarrollada con [Vue 3](https://vuejs.org/) y [Bootstrap 5](https://getbootstrap.com/).

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+ (recomendado 20+)
- NPM o Yarn

### Instalación de dependencias
```bash
npm install
```

### Modo de desarrollo con recarga en vivo
```bash
npm run serve
```
La aplicación estará disponible en [http://localhost:8080](http://localhost:8080).

### Compilación para producción
```bash
npm run build
```
Los archivos optimizados se generarán en la carpeta `dist/`.

## 🎨 Características de la Interfaz
- **Diseño Minimalista & Vibrante:** Paleta basada en azul fuerte (`#1d4ed8` / `#2563eb`) con acentos de color para estados y prioridades.
- **Logo Vectorial Dinámico:** Componente `<AppLogo />` escalable y con soporte de temas claro/oscuro.
- **Acceso Rápido Demo:** Botones de un clic en el inicio de sesión para pruebas como Admin, Técnico o Usuario.
- **Métricas & KPIs en Tiempo Real:** Filtros interactivos de tickets con contador dinámico.
- **Exportación CSV:** Descarga directa de reportes de tickets filtrados.
- **Timeline de Seguimiento:** Historial cronológico con autores y motivos.
