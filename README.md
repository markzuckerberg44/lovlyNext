## Informacion grupo
Grupo 8 <br>
Julian Honores / 21.328.088-0 <br>
Mauricio Muñoz / 21.542.213-5 <br>
Ien Zavala / 21.216.002-4 <br>
Carlos Tapia / 21.485.544-8

# Lovly - Gestión Integral de Relaciones de Pareja

Lovly es una aplicación moderna diseñada para ayudar a las parejas a gestionar y fortalecer su relación mediante el seguimiento de aspectos fundamentales que a menudo se pasan por alto. La app permite monitorear el ciclo menstrual, registrar momentos de intimidad y uso de anticonceptivos, crear y organizar panoramas (actividades en pareja), elegir planes al azar cuando no saben qué hacer, y gestionar listas de tareas compartidas. Además, incluye una sección de finanzas para llevar un control claro de gastos y préstamos entre la pareja. Lovly convierte datos duros en información valiosa, ayudando a las parejas a mantener la transparencia, organización y comunicación que son esenciales para una relación saludable y duradera.

## Características Principales

- **Salud y Bienestar**: Monitoreo de ciclos menstruales, registro de intimidad y seguimiento de anticonceptivos
- **Panoramas**: Crea, organiza y elige actividades en pareja al azar
- **Listas de Tareas**: Gestiona pendientes compartidos con estados (To do, Haciendo, Hecho)
- **Finanzas**: Control de gastos y préstamos para mantener las cuentas claras
- **Dashboard**: Visualización de datos y estadísticas mediante gráficos interactivos
- **Gestión de Pareja**: Sistema de invitaciones y códigos únicos para conectar con tu pareja

## Tecnologías Utilizadas

- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Supabase) con Prisma ORM
- **Autenticación**: Supabase Auth
- **Gráficos**: Chart.js (react-chartjs-2)
- **Iconos**: React Icons
- **Estado Global**: Redux Toolkit (para filtros y preferencias locales)

### Dependencias principales
Si bien estas son las dependencias principales, utilizamos supabase para almacenar la base de datos en la nube y no dejaremos nuestras variables de entorno publicas, asi que les recomendamos probar la aplicacion hosteada en Vercel mediante el siguiente link: https://lovly-next.vercel.app/
```bash
npm install next@16.0.8 react@19.2.1 react-dom@19.2.1
npm install @prisma/client@^7.1.0 @prisma/adapter-pg@^7.1.0 pg@^8.16.3
npm install @supabase/ssr@^0.8.0 @supabase/supabase-js@^2.87.0
npm install @reduxjs/toolkit@^2.11.1 react-redux@^9.2.0
npm install chart.js@^4.5.1 react-chartjs-2@^5.3.1 chartjs-adapter-date-fns@^3.0.0 date-fns@^4.1.0
npm install react-icons@^5.5.0
npm install @neondatabase/serverless@^1.0.2 @prisma/adapter-neon@^7.1.0
```

## Config Next.js

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
