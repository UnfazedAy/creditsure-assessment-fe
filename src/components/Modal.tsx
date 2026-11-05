import { useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { useModalBehavior } from '../hooks/useModalBehavior';

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export default function Modal({ title, onClose, children, footer }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useModalBehavior(ref, onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/40 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="card max-h-[90vh] w-full max-w-md overflow-y-auto shadow-lg"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="btn-secondary !min-h-0 h-8 w-8 !px-0">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}
