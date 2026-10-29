# Guía de Contribución a Open-Ticket

¡Gracias por tu interés en contribuir a **Open-Ticket**! Este proyecto es de código abierto y agradecemos aportes de la comunidad en forma de código, documentación, reporte de fallas o ideas de nuevas características.

---

## 📌 Código de Conducta
Buscamos un ambiente amigable, colaborativo e inclusivo para toda persona que participe en este proyecto. Trata a los demás con respeto y empatía.

---

## 🛠️ Cómo Empezar

1. **Haz un Fork** del repositorio en GitHub.
2. **Clona tu copia** localmente:
   ```bash
   git clone https://github.com/tu-usuario/open-ticket.git
   cd open-ticket
   ```
3. **Crea una rama (branch)** para tu contribución:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   # o
   git checkout -b fix/solucion-a-bug
   ```

---

## 💻 Desarrollo Local

### 1. Base de Datos
- Levanta PostgreSQL y ejecuta el archivo:
  ```bash
  createdb open_ticket
  psql -d open_ticket -f database/schema.sql
  ```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run seed     # Siembra usuarios de demostración
npm run dev      # Servidor en modo desarrollo (http://localhost:3000)
```

### 3. Frontend
```bash
cd frontend
npm install
npm run serve    # Interfaz en http://localhost:8080
```

---

## 🧪 Estándares de Código
- Mantén la estética **minimalista y limpia** del diseño, respetando la paleta de colores oficial (azul fuerte `#1d4ed8` / `#2563eb` con indicadores de estado suaves).
- Usa nombres descriptivos en español para variables y funciones de negocio.
- Asegúrate de que `npm run build` en el frontend termine exitosamente sin errores de sintaxis antes de enviar un Pull Request.

---

## 📬 Envío de Pull Requests
1. Realiza commits atómicos y claros:
   ```bash
   git commit -m "feat: agrega soporte para adjuntar archivos a tickets"
   ```
2. Haz push a tu rama:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```
3. Abre un **Pull Request** explicando detalladamente los cambios realizados.
