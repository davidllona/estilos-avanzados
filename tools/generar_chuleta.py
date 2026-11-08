#!/usr/bin/env python3
"""Genera assets/js/chuleta-data.js con todos los bloques de código sueltos
(script[type="text/x-code"]) de las lecciones. Ejecutar desde la raíz del repo:
    python3 tools/generar_chuleta.py
"""
import json, re, html, pathlib, textwrap

root = pathlib.Path(__file__).resolve().parent.parent
items = []
for f in sorted((root / 'lecciones').glob('*.html')):
    src = f.read_text(encoding='utf-8')
    lesson = re.search(r'data-lesson="([^"]+)"', src).group(1)
    title = html.unescape(re.search(r'<h1>(.*?)</h1>', src, re.S).group(1)).strip()
    # sección (h2) en la que está cada bloque
    for m in re.finditer(r'<script type="text/x-code"([^>]*)>(.*?)</script>', src, re.S):
        attrs, code = m.group(1), m.group(2)
        lang = (re.search(r'data-lang="([^"]+)"', attrs) or [None, 'css'])[1]
        label = re.search(r'data-label="([^"]+)"', attrs)
        before = src[:m.start()]
        h2s = re.findall(r'<h2[^>]*>(.*?)</h2>', before, re.S)
        section = re.sub(r'<[^>]+>', '', h2s[-1]).strip() if h2s else ''
        code = textwrap.dedent(code.strip('\n')).rstrip()
        items.append({
            'leccion': lesson, 'archivo': f.name, 'titulo': title, 'seccion': html.unescape(section),
            'etiqueta': html.unescape(label.group(1)) if label else '', 'lang': lang, 'codigo': code,
        })
out = root / 'assets' / 'js' / 'chuleta-data.js'
out.write_text('/* Generado por tools/generar_chuleta.py: no editar a mano */\nwindow.CHULETA = ' + json.dumps(items, ensure_ascii=False, indent=1) + ';\n', encoding='utf-8')
print(f'{len(items)} fragmentos -> {out.relative_to(root)}')
