import type { Predio } from "@/components/predios/PredioCard";

/* ═══════════════════════════════════════════════════════════════════════════
   Contenido del portafolio de predios.

   Vive aparte de la página porque lo pintan dos árboles: el lienzo de 1920 y
   la vista fluida de móvil y tablet.
   ═══════════════════════════════════════════════════════════════════════════ */

/** `x` y `w` salen del frame de la barra (100:3062): canales de 27 px. */
export const FILTERS = [
  { label: "País", value: "Todos", x: 401, w: 150 },
  { label: "Ciudad", value: "Todas", x: 578, w: 195 },
  { label: "Zona", value: "Todas", x: 800, w: 157 },
  { label: "Capital requerido", value: "Cualquiera", x: 984, w: 170 },
  { label: "Tipo de transformación", value: "Todas", x: 1181, w: 264 },
  { label: "Ordenar por", value: "Mayor Score Zequara", x: 1472, w: 198 },
];

export const PREDIOS: Predio[] = [
  {
    badge: { label: "Disponible", tone: "green" }, score: 96,
    photo: "La Cabrera, Bogotá", city: "La Cabrera · Bogotá",
    title: "Apartamento de gran formato con potencial de reconversión",
    chip: "Reposicionamiento premium", specs: "320 m² · 3 hab · 3 baños · 2 parq",
    price: "COP $3.100M", priceNote: "Compra + remodelación",
    tir: 16, horizon: "Horizonte: 5 años", status: "Abierto para evaluación",
  },
  {
    badge: { label: "Disponible", tone: "green" }, score: 88,
    photo: "Laureles, Medellín", city: "Laureles · Medellín",
    title: "Casa con potencial de división en dos unidades",
    chip: "División en dos unidades", specs: "260 m² · 4 hab · 3 baños · 2 parq",
    price: "COP $1.450M", priceNote: "Compra + remodelación",
    tir: 17, horizon: "Horizonte: 5 años", status: "Abierto para evaluación",
  },
  {
    badge: { label: "Disponible", tone: "green" }, score: 85,
    photo: "Punta Pacífica, Ciudad de Panamá", city: "Punta Pacífica · Ciudad de Panamá",
    title: "Torre exclusiva lista para remodelación integral",
    chip: "Remodelación completa", specs: "150 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $1.520M", priceNote: "Compra + remodelación",
    tir: 15, horizon: "Horizonte: 4 años", status: "Abierto para evaluación",
  },
  {
    badge: { label: "Nueva oportunidad", tone: "gold" }, score: 90,
    photo: "El Poblado, Medellín", city: "El Poblado · Medellín",
    title: "Unidad reconvertible en edificio boutique",
    chip: "Remodelación completa", specs: "145 m² · 2 hab · 2 baños · 1 parq",
    price: "COP $1.180M", priceNote: "Compra + remodelación",
    tir: 18, horizon: "Horizonte: 4 años", status: "Recién incorporada al portafolio",
  },
  {
    badge: { label: "Reserva liberada", tone: "green" }, score: 86,
    photo: "Costa del Este, Ciudad de Panamá", city: "Costa del Este · Ciudad de Panamá",
    title: "Unidad premium con potencial de mejor distribución",
    chip: "Cambio de distribución", specs: "160 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $1.680M", priceNote: "Compra + remodelación",
    tir: 14, horizon: "Horizonte: 5 años", status: "Disponible nuevamente",
  },
  {
    badge: { label: "Alta actividad", tone: "amber" }, score: 92,
    photo: "Chicó, Bogotá", city: "Chicó · Bogotá",
    title: "Piso alto con vista, ideal para ampliar la zona social",
    chip: "Cambio de distribución", specs: "210 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $2.050M", priceNote: "Compra + remodelación",
    tir: 15, horizon: "Horizonte: 5 años", status: "Actualmente en evaluación por inversionistas",
  },
  {
    badge: { label: "En proceso de reserva", tone: "steel" }, score: 87,
    photo: "Bocagrande, Cartagena", city: "Bocagrande · Cartagena",
    title: "Apartamento frente al mar para reposicionar a premium",
    chip: "Reposicionamiento premium", specs: "180 m² · 3 hab · 3 baños · 1 parq",
    price: "COP $1.950M", priceNote: "Compra + remodelación",
    tir: 15, horizon: "Horizonte: 5 años", status: "Reserva en validación",
  },
  {
    badge: { label: "Reservada", tone: "dark" }, score: 91,
    photo: "Rosales, Bogotá", city: "Rosales · Bogotá",
    title: "Clásico de Rosales reservado recientemente",
    chip: "Reposicionamiento premium", specs: "190 m² · 2 hab · 2 baños · 2 parq",
    price: "COP $1.900M", priceNote: "Compra + remodelación",
    tir: 16, horizon: "Horizonte: 5 años", status: "Oportunidad reservada",
  },
];
