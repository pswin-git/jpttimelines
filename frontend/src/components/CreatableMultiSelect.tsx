import { useState, useRef, useEffect } from 'react';

interface Option { id: number; name: string; }

interface Props {
  label?: string;
  options: Option[];
  selected: number[];
  onChange: (ids: number[]) => void;
  onCreate: (name: string) => Promise<Option>;
  placeholder?: string;
}

export function CreatableMultiSelect({
  label, options, selected, onChange, onCreate, placeholder = 'Add…',
}: Props) {
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOptions = options.filter(o => selected.includes(o.id));
  const filtered = options.filter(
    o => !selected.includes(o.id) && o.name.toLowerCase().includes(input.toLowerCase()),
  );
  const showCreate =
    input.trim().length > 0 &&
    !options.some(o => o.name.toLowerCase() === input.trim().toLowerCase());

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  async function handleCreate() {
    const name = input.trim();
    if (!name || creating) return;
    setCreating(true);
    try {
      const created = await onCreate(name);
      onChange([...selected, created.id]);
      setInput('');
    } finally {
      setCreating(false);
    }
  }

  function toggle(id: number) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
    setInput('');
  }

  function remove(id: number) {
    onChange(selected.filter(x => x !== id));
  }

  const showDropdown = open && (showCreate || filtered.length > 0);

  return (
    <div className="cms" ref={containerRef}>
      {label && <label className="cms-label">{label}</label>}
      <div className="cms-control" onClick={() => setOpen(true)}>
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
        <input
          className="cms-input"
          value={input}
          onChange={e => { setInput(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={e => {
            if (e.key === 'Escape') { setOpen(false); }
            if (e.key === 'Enter') { e.preventDefault(); if (showCreate) handleCreate(); }
          }}
          placeholder={selected.length === 0 ? placeholder : ''}
          disabled={creating}
        />
      </div>
      {showDropdown && (
        <ul className="cms-dropdown">
          {showCreate && (
            <li
              className="cms-option cms-create"
              onMouseDown={e => { e.preventDefault(); handleCreate(); }}
            >
              {creating ? 'Creating…' : `Create "${input.trim()}"`}
            </li>
          )}
          {filtered.map(o => (
            <li
              key={o.id}
              className="cms-option"
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
