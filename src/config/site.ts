const whatsapp = (import.meta.env.PUBLIC_WHATSAPP_NUMBER || '543624701036').replace(/\D/g, '');
const instagram = import.meta.env.PUBLIC_INSTAGRAM_URL || 'https://www.instagram.com/koderyx/';
const email = import.meta.env.PUBLIC_CONTACT_EMAIL || '';

export const site = {
  name: 'KODERYX',
  tagline: 'Software Solutions',
  domain: 'https://koderyx.com.ar',
  email,
  whatsapp,
  instagram,
  portfolio: 'https://devsantivalenti.netlify.app/',
  whatsappMessage: 'Hola, vi la página de Koderyx y quisiera consultar por un proyecto.',
  networks: { instagram },
};

export const whatsappUrl = whatsapp
  ? `https://wa.me/${whatsapp}?text=${encodeURIComponent(site.whatsappMessage)}`
  : null;

export const navigation = [
  { label: 'Inicio', href: '/' },
  { label: 'Servicios', href: '/#servicios' },
  { label: 'Proyectos', href: '/#proyectos' },
  { label: 'Proceso', href: '/#proceso' },
  { label: 'Nosotros', href: '/#nosotros' },
];
