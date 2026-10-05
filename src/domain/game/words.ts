import type { WordEntry } from "./game.types";

export const WORDS: readonly WordEntry[] = [
  { word: "JIRAFA", hint: "Tiene el cuello muy largo", category: "animales" },
  { word: "PINGÜINO", hint: "Ave que nada entre hielos", category: "animales" },
  { word: "MARIPOSA", hint: "Cambia antes de tener alas", category: "animales" },
  { word: "CAMALEÓN", hint: "Puede cambiar de color", category: "animales" },
  { word: "TIBURÓN", hint: "Gran nadador de dientes afilados", category: "animales" },
  { word: "CHOCOLATE", hint: "Dulce que nace del cacao", category: "comida" },
  { word: "EMPANADA", hint: "Masa rellena y crujiente", category: "comida" },
  { word: "LIMONADA", hint: "Bebida fresca y un poco ácida", category: "comida" },
  { word: "AREQUIPE", hint: "Dulce cremoso hecho con leche", category: "comida" },
  { word: "ZANAHORIA", hint: "Hortaliza naranja y crujiente", category: "comida" },
  { word: "BRÚJULA", hint: "Señala el camino hacia el norte", category: "aventura" },
  { word: "TESORO", hint: "Los piratas lo guardan muy bien", category: "aventura" },
  { word: "CASCADA", hint: "Un río que cae desde lo alto", category: "aventura" },
  { word: "MONTAÑA", hint: "Llegar a su cima es todo un reto", category: "aventura" },
  { word: "MOCHILA", hint: "Lleva lo necesario en tu espalda", category: "aventura" },
] as const;
