#!/bin/zsh
# check-alucinaciones.sh — Validación semanal anti-alucinaciones
# Se ejecuta via crontab cada lunes a las 9:05

LOG="/Users/angeldanieljimenezhurtado/Desktop/mercadona-guia/validacion.log"
DATE=$(date '+%Y-%m-%d %H:%M')

echo "──────────────────────────────────────" >> "$LOG"
echo "[$DATE] Inicio validación" >> "$LOG"

/usr/local/bin/node /Users/angeldanieljimenezhurtado/Desktop/mercadona-guia/validar-guia.js --full >> "$LOG" 2>&1

EXIT=$?
echo "[$DATE] Fin — exit code: $EXIT" >> "$LOG"

# Si hay errores (posibles alucinaciones), mostrar notificación macOS
if [ $EXIT -ne 0 ]; then
  osascript -e 'display notification "Hay posibles alucinaciones en la guía Mercadona. Revisa validacion.log" with title "Guía Mercadona — Validación" sound name "Basso"'
fi
