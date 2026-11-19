# Publicación de la wiki

`docs/` es la fuente oficial. El workflow `Publish documentation wiki` publica sus Markdown, imágenes y navegación cuando cambian en `main`, o al ejecutarlo manualmente. La sincronización reemplaza el contenido de la wiki: los cambios deben hacerse mediante PR en este repositorio.

## Configuración inicial

1. En GitHub, abre Wiki y crea la primera página. Esto inicializa el repositorio `ia-curriculum.wiki.git`.
2. Crea un token con acceso de escritura a la wiki. Un PAT clásico necesita el alcance `public_repo` para este repositorio público; para repositorios privados, `repo`. Usa una cuenta con permiso de escritura y autoriza SSO si corresponde. No guardes el token en archivos.
3. Añádelo como secreto de Actions llamado `WIKI_TOKEN` en Settings → Secrets and variables → Actions. El workflow no depende de que `GITHUB_TOKEN` pueda escribir en el repositorio separado de la wiki.
4. Integra el workflow en `main` y ejecútalo desde Actions. Confirma que Home, navegación e imágenes abren correctamente.

## Generación local

Desde la raíz del repositorio:

```bash
python3 scripts/build-wiki.py --output /tmp/ia-curriculum-wiki-preview --repository p-donoso/ia-curriculum
```

El destino debe estar vacío y fuera del repositorio. `docs/README.md` se convierte en Home; las demás páginas usan su ruta separada por `--`. Los enlaces Markdown locales se adaptan a páginas de wiki, recursos o archivos de `main`. Los enlaces externos y anclas locales se conservan. No se interpretan enlaces HTML ni referencias Markdown de estilo `[nombre][id]`; usa enlaces Markdown directos para contenido publicado.

La generación local no publica. El workflow usa un clon temporal, conserva `.git`, elimina páginas obsoletas y omite commits sin cambios. Nunca imprime el token ni lo incorpora a la URL remota.
