export interface Project {
  slug: string;
  name: string;
  shortName: string;
  sector: string;
  category: string;
  description: string;
  problem: string;
  solution: string;
  features: string[];
  technologies: string[];
  result: string;
  cover: { src: string; alt: string; width: number; height: number } | null;
  screenshots: { src: string; alt: string; width: number; height: number }[];
  logos: { src: string; alt: string; width: number; height: number }[];
  url?: string;
}

// Agregar únicamente capturas, tecnologías y enlaces confirmados por cada proyecto.
// Las capturas se muestran sin filtros de color ni recoloraciones.
export const projects: Project[] = [
  {
    slug: 'sonrie-plus', name: 'SONRÍE+', shortName: 'SONRÍE+',
    sector: 'Salud · Odontología', category: 'Plataforma web',
    description: 'Una plataforma que conecta pacientes y profesionales, gestiona reservas y centraliza procesos odontológicos.',
    problem: 'Conectar a pacientes y profesionales y organizar las reservas dentro de un mismo entorno digital.',
    solution: 'Una plataforma odontológica que reúne la conexión entre pacientes y profesionales, la gestión de reservas y los procesos asociados.',
    features: ['Conexión entre pacientes y profesionales', 'Gestión de reservas', 'Centralización de procesos odontológicos'],
    technologies: [],
    result: 'Un entorno común para conectar a las personas con la atención odontológica y organizar las reservas.',
    cover: null, screenshots: [{ src: '/images/projects/sonrie-plus-screen.webp', alt: 'Captura real del inicio de SONRÍE+: búsqueda de profesionales y servicios odontológicos.', width: 1440, height: 960 }],
    logos: [{ src: '/images/projects/sonrie-logo.svg', alt: 'Logo oficial de SONRÍE+', width: 950, height: 404 }],
    url: 'https://riemas.com.ar/',
  },
  {
    slug: 'electrodental-nea', name: 'ELECTRODENTAL NEA', shortName: 'ELECTRODENTAL NEA',
    sector: 'Comercio · Odontología', category: 'Ecommerce',
    description: 'Una tienda online para el sector odontológico, con catálogo, carrito y herramientas de gestión comercial.',
    problem: 'Reunir la oferta de productos odontológicos y la gestión comercial en una experiencia de compra accesible desde distintos dispositivos.',
    solution: 'Un ecommerce con catálogo de productos, carrito y herramientas de gestión, pensado para una experiencia responsive.',
    features: ['Catálogo de productos', 'Carrito de compras', 'Gestión comercial', 'Experiencia responsive'],
    technologies: [],
    result: 'Un canal digital que reúne la presentación de productos, la compra y la gestión comercial.',
    cover: null, screenshots: [{ src: '/images/projects/electrodental-nea-screen.webp', alt: 'Captura real de ELECTRODENTAL NEA: catálogo de equipamiento e insumos odontológicos.', width: 1440, height: 960 }],
    logos: [{ src: '/images/projects/electrodental-logo.webp', alt: 'Logo oficial de ELECTRODENTAL NEA', width: 500, height: 239 }],
    url: 'https://electrodentalnea.com.ar/',
  },
  {
    slug: 'gimnasios', name: 'HALCÓN GYM + CLUBFIT HOUSE', shortName: 'HALCÓN + CLUBFIT',
    sector: 'Fitness · Gimnasios', category: 'Sistema de gestión',
    description: 'Gestión de socios, acceso, cuotas y caja. La operación del gimnasio, centralizada en un sistema.',
    problem: 'Organizar la administración diaria de un gimnasio: socios, ingresos, cuotas y movimientos de caja.',
    solution: 'Un sistema de gestión para gimnasios que integra la administración de socios, el control de acceso, las cuotas, la caja y las estadísticas.',
    features: ['Administración de socios', 'Control de acceso', 'Gestión de cuotas', 'Caja y estadísticas'],
    technologies: [],
    result: 'Una herramienta que centraliza las tareas de gestión y la información de la operación del gimnasio.',
    cover: null, screenshots: [],
    logos: [
      { src: '/images/projects/halcon-logo.webp', alt: 'Logo oficial de HALCÓN GYM', width: 500, height: 500 },
      { src: '/images/projects/clubfit-logo.webp', alt: 'Logo oficial de ClubFit House', width: 500, height: 500 },
    ],
  },
];
