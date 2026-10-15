import { X } from 'lucide-react';
import type { ReactNode } from 'react';

export function Modal({ title, children, onClose, className = '' }: { title: string; children: ReactNode; onClose: () => void; className?: string }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`modal ${className}`} role="dialog" aria-modal="true" aria-label={title} dir="rtl">
      <button className="icon-button modal-close" onClick={onClose} aria-label="إغلاق" data-testid="button-close-modal"><X size={18} /></button>
      <h2>{title}</h2>{children}
    </section>
  </div>;
}
