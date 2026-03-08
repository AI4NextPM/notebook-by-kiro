# Project Structure

```
app/                    # Next.js App Router root
  layout.tsx            # Root layout (fonts, metadata, global CSS import)
  page.tsx              # Main page entry point
  globals.css           # Global styles, Tailwind import, CSS variables
  components/           # React components (co-located with app)
  lib/                  # Shared utilities, hooks, types, storage modules
public/                 # Static assets (SVGs, images)
__tests__/              # Test files (mirrors source structure)
```

## Rules

- Pages and layouts live directly in `app/`
- Reusable components go in `app/components/`
- Non-UI logic (hooks, types, storage) goes in `app/lib/`
- CSS Modules (`.module.css`) are co-located next to their component
- Tests go in `__tests__/` at the project root, mirroring the source tree
