import { whatsappLink, waMessages } from '@/lib/whatsapp';

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(waMessages.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-float fixed bottom-5 right-5 z-50 hidden lg:inline-flex items-center gap-3 border border-line bg-paper/90 text-ink backdrop-blur px-4 py-3 text-sm tracking-wide transition-[transform,opacity,border-color] duration-300 ease-editorial hover:-translate-y-0.5 hover:border-ink"
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-ink" />
      WhatsApp
    </a>
  );
}
