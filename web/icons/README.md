# Local icons

astro-icon loads local SVG icons from this directory (`iconDir` in
astro.config.mjs). It is intentionally empty: the site's UI icons are inline
SVGs in `web/components/Icon.astro`, and astro-icon logs a warning on every
dev start and build when this directory does not exist. Drop SVG files here
only if a `local:` astro-icon icon is ever needed.
