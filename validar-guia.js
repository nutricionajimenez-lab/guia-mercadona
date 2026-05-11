#!/usr/bin/env node
// validar-guia.js — Subagente de validación anti-alucinaciones
// Uso: node validar-guia.js
// Comprueba que los productos en datos-productos.json coinciden con la API real de Mercadona

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATOS_PATH = path.join(__dirname, 'datos-productos.json');
const BASELINE_PATH = path.join(__dirname, 'baseline-productos.json');
const BASE = 'https://tienda.mercadona.es/api';

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function fetchProducto(id) {
  await sleep(200);
  const cleanId = String(id).split('.')[0]; // strip variant suffixes like .1 .2
  try {
    const res = await fetch(`${BASE}/products/${cleanId}/?lang=es`, {
      headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
    });
    if (res.status === 404) return null;
    if (res.status === 403) {
      await sleep(3000);
      const r2 = await fetch(`${BASE}/products/${cleanId}/?lang=es`, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' }
      });
      if (!r2.ok) return null;
      return r2.json();
    }
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function normalizar(nombre) {
  return nombre.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function similitud(a, b) {
  const na = normalizar(a);
  const nb = normalizar(b);
  if (na === nb) return 1.0;
  // Comprobar si uno contiene al otro
  if (na.includes(nb) || nb.includes(na)) return 0.85;
  // Palabras en común
  const pa = new Set(na.split(' '));
  const pb = new Set(nb.split(' '));
  const comunes = [...pa].filter(w => pb.has(w) && w.length > 3).length;
  const total = Math.max(pa.size, pb.size);
  return comunes / total;
}

async function main() {
  // --fast → solo comparar baseline, sin llamadas API (para el hook)
  // --full → validación completa contra API (para el cron periódico)
  const modo = process.argv[2] === '--fast' ? 'fast' : 'full';

  if (!existsSync(DATOS_PATH)) {
    console.error('ERROR: No se encuentra datos-productos.json. Ejecuta primero node scraper.js');
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(DATOS_PATH, 'utf8'));

  // Soporta tanto array plano como { secciones: [...] }
  let todosProductos;
  if (Array.isArray(raw)) {
    todosProductos = raw.map(p => ({
      id: p.id,
      nombre: p.display_name,
      seccion: p._subcatNombre || '?'
    }));
  } else {
    const secciones = raw.secciones || [];
    todosProductos = secciones.flatMap(s =>
      (s.productos || []).map(p => ({
        id: p.id,
        nombre: p.display_name,
        seccion: s.titulo
      }))
    );
  }

  // ── Modo rápido: solo verificar baseline (sin API) ─────────────────────────
  const productosActuales = new Set(todosProductos.map(p => p.id));

  if (existsSync(BASELINE_PATH)) {
    const baseline = JSON.parse(readFileSync(BASELINE_PATH, 'utf8'));
    const productosBase = new Set(baseline.map(p => p.id));

    const nuevos = todosProductos.filter(p => !productosBase.has(p.id));
    const eliminados = baseline.filter(p => !productosActuales.has(p.id));

    if (nuevos.length > 0) {
      console.log('🚨 PRODUCTOS AÑADIDOS (no autorizados):');
      for (const p of nuevos) {
        console.log(`  + [${p.seccion}] ID ${p.id} — "${p.nombre}"`);
      }
      console.log('');
    }
    if (eliminados.length > 0) {
      console.log('🗑  PRODUCTOS ELIMINADOS desde el baseline:');
      for (const p of eliminados) {
        console.log(`  - [${p.seccion}] ID ${p.id} — "${p.nombre}"`);
      }
      console.log('');
    }
    if (nuevos.length === 0 && eliminados.length === 0) {
      console.log(`✅ [${modo}] Sin cambios vs baseline (${todosProductos.length} productos).\n`);
    }
  } else {
    const baselineData = todosProductos.map(p => ({ id: p.id, nombre: p.nombre, seccion: p.seccion }));
    writeFileSync(BASELINE_PATH, JSON.stringify(baselineData, null, 2));
    console.log(`📌 Baseline creado con ${baselineData.length} productos.\n`);
  }

  if (modo === 'fast') {
    console.log('(Modo rápido: sin verificación API. Usa --full para validación completa)');
    return;
  }

  console.log(`\nValidando ${todosProductos.length} productos contra la API de Mercadona...\n`);

  // ── 1. Verificar alucinaciones: nombre real vs. nombre en guía ──────────────
  const errores = [];
  const advertencias = [];
  let ok = 0;

  for (const prod of todosProductos) {
    const api = await fetchProducto(prod.id);

    if (!api) {
      errores.push(`[ID ${prod.id}] "${prod.nombre}" — NO EXISTE en la API`);
      continue;
    }

    const nombreApi = api.display_name || '';
    const sim = similitud(prod.nombre, nombreApi);

    if (sim < 0.5) {
      errores.push(
        `[ID ${prod.id}] NOMBRE INCORRECTO\n  Guía: "${prod.nombre}"\n  API:  "${nombreApi}"\n  Similitud: ${(sim*100).toFixed(0)}%`
      );
    } else if (sim < 0.75) {
      advertencias.push(
        `[ID ${prod.id}] Nombre ligeramente diferente\n  Guía: "${prod.nombre}"\n  API:  "${nombreApi}"\n  Similitud: ${(sim*100).toFixed(0)}%`
      );
    } else {
      ok++;
    }
  }

  // ── 2. Resumen ──────────────────────────────────────────────────────────────
  console.log('═══════════════════════════════════════════');
  console.log(`  Correctos:    ${ok}`);
  console.log(`  Advertencias: ${advertencias.length}`);
  console.log(`  Errores:      ${errores.length}`);
  console.log('═══════════════════════════════════════════\n');

  if (advertencias.length > 0) {
    console.log('⚠️  ADVERTENCIAS:');
    advertencias.forEach(a => console.log('  ' + a));
    console.log('');
  }

  if (errores.length > 0) {
    console.log('❌ ERRORES (posibles alucinaciones):');
    errores.forEach(e => console.log('  ' + e));
    console.log('');
    process.exit(1);
  } else {
    console.log('✅ Validación completada sin errores críticos.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
