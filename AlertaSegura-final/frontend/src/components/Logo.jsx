// Ícono de marca reutilizable — antes estaba duplicado inline en el Navbar.
// Un pin/escudo simple: representa "ubicación" + "alerta cívica".
function Logo({ size = 'md', showText = true }) {
  const dimensiones = {
    sm: { box: 'w-8 h-8', icon: 'h-4 w-4', text: 'text-sm' },
    md: { box: 'w-9 h-9', icon: 'h-5 w-5', text: 'text-base' },
    lg: { box: 'w-14 h-14', icon: 'h-8 w-8', text: 'text-2xl' },
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dimensiones.box} bg-gradient-to-br from-marca-600 to-marca-900 rounded-xl flex items-center justify-center shadow-md shadow-marca-900/20 shrink-0`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`${dimensiones.icon} text-white`} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3c-3.6 0-6.5 2.9-6.5 6.5C5.5 14 12 21 12 21s6.5-7 6.5-11.5C18.5 5.9 15.6 3 12 3z"
            fill="currentColor"
            fillOpacity="0.95"
          />
          <circle cx="12" cy="9.5" r="2.3" fill="var(--color-marca-700, #6d28d9)" />
        </svg>
      </div>
      {showText && (
        <span className={`font-display font-semibold text-gray-900 dark:text-gray-100 tracking-tight ${dimensiones.text}`}>
          AlertaSegura
        </span>
      )}
    </div>
  );
}

export default Logo;
