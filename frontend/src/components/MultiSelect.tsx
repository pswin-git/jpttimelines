import { useState, useRef, useEffect } from 'react';

interface Option { id: number; name: string; }

interface Props {
  label?: string;
  options: Option[];
  selected: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
}

export function MultiSelect({ label, options, selected, onChange, placeholder = 'Any' }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter(o => selected.includes(o.id));
  const available = options.filter(o => !selected.includes(o.id));

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  }

  function remove(id: number) {
    onChange(selected.filter(x => x !== id));
  }

  return (
    <div className="ms" ref={containerRef}>
      {label && <label className="ms-label">{label}</label>}
      <div className="ms-control" onClick={() => setOpen(v => !v)}>
        {selectedOptions.length === 0 ? (
          <span className="ms-placeholder">{placeholder}</span>
        ) : (
          <div className="ms-chips">
            {selectedOptions.map(o => (
              <span key={o.id} className="chip chip-selected">
                {o.name}
                <button
                  type="button"
                  className="chip-remove"
                  onClick={e => { e.stopPropagation(); remove(o.id); }}
                >×</button>
              </span>
            ))}
          </div>
        )}
        <span className="ms-arrow">{open ? '▴' : '▾'}</span>
      </div>
      {open && available.length > 0 && (
        <ul className="ms-dropdown">
          {available.map(o => (
            <li
              key={o.id}
              className="ms-option"
              onMouseDown={e => { e.preventDefault(); toggle(o.id); }}
            >
              {o.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
