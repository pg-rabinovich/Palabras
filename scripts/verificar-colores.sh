#!/bin/sh
# Falla si aparecen colores escritos a mano en componentes o paginas.
# Los colores viven SOLO en app/globals.css como tokens (ver docs/tokens.md).
# Excepciones: el sanitizador (valida colores guardados en textos viejos) y los
# sketches de canvas (fondo-glitch), que pintan arte con la paleta de marca.
encontrados=$(grep -rnE "rgba?\(|#[0-9a-fA-F]{6}\b|\[#[0-9a-fA-F]{3,8}\]" app components lib \
  --include=*.ts --include=*.tsx \
  | grep -v "lib/sanitizar-html.ts" \
  | grep -v "components/auth/fondo-glitch.tsx")
if [ -n "$encontrados" ]; then
  echo "Colores fijos encontrados (usa un token de globals.css):"
  echo "$encontrados"
  exit 1
fi
echo "Sin colores fijos en el codigo."
