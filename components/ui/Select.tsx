import React, { createContext, useContext, useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../icons/Icons';
import { cn } from '../../lib/utils';

// --- CONTEXT ---
interface SelectContextProps {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedValue: string | undefined;
  onValueChange: (value: string) => void;
  selectedLabel: React.ReactNode | null;
  selectRef: React.RefObject<HTMLDivElement>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  disabled?: boolean;
}

const SelectContext = createContext<SelectContextProps | undefined>(undefined);

const useSelect = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error('useSelect must be used within a Select provider');
  }
  return context;
};

// --- SELECT (Root Component) ---
interface SelectProps {
  children: React.ReactNode;
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ children, value, onValueChange = () => {}, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current && !selectRef.current.contains(event.target as Node) &&
        contentRef.current && !contentRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleValueChange = (newValue: string) => {
    onValueChange(newValue);
    setIsOpen(false);
  };
  
  const selectedLabel = useMemo(() => {
    let label: React.ReactNode | null = null;
    const contentChild = React.Children.toArray(children).find(
      (child) => React.isValidElement(child) && child.type === SelectContent
    );

    if (React.isValidElement<{ children: React.ReactNode }>(contentChild)) {
      React.Children.forEach(contentChild.props.children, (itemNode) => {
        if (React.isValidElement<{ value: string; children: React.ReactNode }>(itemNode)) {
          if (itemNode.props.value === value) {
            label = itemNode.props.children;
          }
        }
      });
    }
    return label;
  }, [children, value]);
  
  return (
    <SelectContext.Provider value={{ isOpen, setIsOpen, selectedValue: value, onValueChange: handleValueChange, selectedLabel, selectRef, contentRef, disabled }}>
      <div className="relative" ref={selectRef}>
          {children}
      </div>
    </SelectContext.Provider>
  );
};

// --- SELECT TRIGGER ---
export const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const { isOpen, setIsOpen, disabled } = useSelect();
  return (
    <button
      onClick={() => !disabled && setIsOpen((prev) => !prev)}
      className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
      disabled={disabled}
    >
      {children}
      <Icons.chevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
};

// --- SELECT VALUE ---
export const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => {
  const { selectedLabel } = useSelect();
  return <>{selectedLabel || placeholder}</>;
};

// --- SELECT CONTENT ---
const SelectContentComponent = React.forwardRef<HTMLDivElement, { children: React.ReactNode; className?: string }>(
  ({ children, className }, forwardedRef) => {
    const { isOpen, selectRef, contentRef } = useSelect();
    const [style, setStyle] = useState<React.CSSProperties>({});
  
    useEffect(() => {
      if (isOpen && selectRef.current) {
        // The trigger is assumed to be the button inside the selectRef container
        const trigger = selectRef.current.querySelector('button');
        if (!trigger) return;

        const rect = trigger.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // A simple heuristic to place above or below, preferring below if space exists
        const placeBelow = spaceBelow > 250 || spaceBelow > rect.top; 
  
        setStyle({
          position: 'fixed',
          width: `${rect.width}px`,
          left: `${rect.left}px`,
          top: placeBelow ? `${rect.bottom + 4}px` : undefined,
          bottom: !placeBelow ? `${window.innerHeight - rect.top + 4}px` : undefined,
          zIndex: 50,
        });
      }
    }, [isOpen, selectRef]);
    
    const handleRef = (node: HTMLDivElement | null) => {
        contentRef.current = node;
        if (typeof forwardedRef === 'function') {
            forwardedRef(node);
        } else if (forwardedRef) {
            forwardedRef.current = node;
        }
    };
  
    if (!isOpen) return null;
  
    return createPortal(
      <div
        ref={handleRef}
        role="listbox"
        style={style}
        className={cn("rounded-md border border-border bg-popover text-popover-foreground shadow-lg animate-in fade-in-0 zoom-in-95", className)}
      >
        <div className="p-1">{children}</div>
      </div>,
      document.body
    );
  }
);
SelectContentComponent.displayName = 'SelectContent';
export const SelectContent = SelectContentComponent;

// --- SELECT ITEM ---
interface SelectItemProps {
  children: React.ReactNode;
  value: string;
}

export const SelectItem: React.FC<SelectItemProps> = ({ children, value }) => {
  const { onValueChange, selectedValue } = useSelect();
  const isSelected = selectedValue === value;
  
  return (
    <div
      onClick={() => onValueChange(value)}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent focus:bg-accent",
        isSelected ? 'font-semibold text-foreground' : 'font-normal'
      )}
      role="option"
      aria-selected={isSelected}
      data-value={value}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Icons.check className="h-4 w-4" />
        </span>
      )}
      {children}
    </div>
  );
};