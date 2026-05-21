import { whatsappLink, waMessages } from '@/lib/whatsapp';

export function WhatsAppFloat() {
  return (
    <a
      href={whatsappLink(waMessages.general)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-float fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-full bg-ink text-paper px-5 py-3 text-sm tracking-wide transition-[transform,opacity] duration-300 ease-editorial hover:-translate-y-0.5"
    >
      WhatsApp
    </a>
  );
}
