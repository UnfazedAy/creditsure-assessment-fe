import { useRef } from 'react';
import { X } from 'lucide-react';
import { useModalBehavior } from '../../hooks/useModalBehavior';
import { Brand, NavList, UserBlock } from './Sidebar';

interface Props {
  onClose: () => void;
  onLogout: () => void;
}

/** Off-canvas drawer for < 768px. Traps focus, closes on Escape, backdrop click, close button, or link click. */
export default function MobileNav({ onClose, onLogout }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useModalBehavior(ref, onClose);

  return (
    <div className="fixed inset-0 z-40 md:hidden" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-ink-900/40" aria-hidden="true" onClick={onClose} />
      <div
        ref={ref}
        id="mobile-nav"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        tabIndex={-1}
        className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col justify-between bg-white p-4 shadow-lg"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Brand />
            <button type="button" onClick={onClose} aria-label="Close menu" className="btn-secondary !min-h-0 h-10 w-10 !px-0">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <NavList labels="always" onNavigate={onClose} />
        </div>
        <UserBlock
          labels="always"
          onLogout={() => {
            onClose();
            onLogout();
          }}
        />
      </div>
    </div>
  );
}
