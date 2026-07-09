"use client";

import { motion } from "framer-motion";
import HubCard, { type CardData } from "./HubCard";

const CARDS: CardData[] = [
  { type: "article", imageLabel: "mercado", category: "Mercado", title: ["Zonas donde la demanda", "defiende el valor por sí sola"], desc: ["Qué hace que un terreno sostenga su", "precio sin depender de la moda."], meta: "6 min de lectura" },
  { type: "video", imageLabel: "remodelación", category: "Remodelación", title: ["Recorrido: una remodelación", "integral de principio a fin"], desc: ["Cómo intervenimos un activo para que", "valga más, sin sobrecostos."], meta: "Video · 4:20" },
  { type: "noticia", imageLabel: "Panamá", category: "Zonas", title: ["Serava amplía operación a", "Ciudad de Panamá"], desc: ["El método completo llega a un nuevo", "mercado para nuestros inversionistas."], meta: "Noticia · Jun 2026" },
  { type: "article", imageLabel: "legal", category: "Legal", title: ["Todo formalizado: por qué", "cada etapa lleva contrato"], desc: ["Transparencia jurídica como parte del", "retorno, no como trámite."], meta: "5 min de lectura" },
  { type: "video", imageLabel: "patrimonio", category: "Patrimonio", title: ["Esto no es crowdfunding: tu", "salida no depende de otros"], desc: ["El inmueble es tuyo. Lo vendes, lo", "hipotecas o lo heredas cuando", "decidas."], meta: "Video · 3:10" },
  { type: "article", imageLabel: "caso La Cabrera", category: "Mercado", title: ["Entrar por debajo del mercado,", "ya remodelado a ultra lujo"], desc: ["Cómo leemos un caso real: La Cabrera,", "Bogotá."], meta: "7 min de lectura" },
  { type: "noticia", imageLabel: "materiales", category: "Remodelación", title: ["Materiales con criterio: menos", "mantenimiento, más valor"], desc: ["Nuestra política de materiales", "naturales y su efecto en el activo."], meta: "Noticia · May 2026" },
  { type: "video", imageLabel: "análisis de zona", category: "Zonas", title: ["Cómo analizamos una zona", "con tecnología antes de entrar"], desc: ["Demanda firme, oferta limitada: el", "primer filtro del modelo."], meta: "Video · 5:45" },
];

/** PAGINA HUB · Grid de 8 tarjetas (3 columnas) con entrada escalonada */
export default function HubCardsGrid() {
  return (
    <motion.div
      className="grid grid-cols-3 gap-x-[24px] gap-y-[24px] w-full"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.1 }}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      {CARDS.map((c, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0 } }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <HubCard data={c} />
        </motion.div>
      ))}
    </motion.div>
  );
}
