# Tattoo Ink Ingredient Decoder - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Schemas](#data-schemas)
3. [Calculation / Logic Algorithms](#calculation--logic-algorithms)
4. [API Reference](#api-reference)
5. [Integration Guide](#integration-guide)
6. [Customization](#customization)
7. [Performance](#performance)
8. [Browser Compatibility](#browser-compatibility)
9. [Security](#security)
10. [Version History](#version-history)
11. [Support and Contact](#support-and-contact)

## Architecture Overview

### Technology Stack

- **HTML5** - Semantic markup with ARIA roles for accessibility
- **CSS3** - Single stylesheet (`/tools/ink-ingredient-decoder/css/style.css`)
- **Vanilla JavaScript (ES6)** - No frameworks, libraries, or dependencies
- **Static file hosting** - No server-side processing, database, or API calls

### File Structure

```
/tools/ink-ingredient-decoder/
├── index.html          # Main HTML document
├── css/
│   └── style.css       # All styling
└── js/
    ├── pigment-data.js # Dataset (~120 entries) and search index
    └── app.js          # Application logic and UI handlers
```

### Component Breakdown

The tool consists of two independent search interfaces within a tabbed layout:

1. **Search Tab** (`#panel-search`)
   - Single text input for pigment name, CAS number, or CI number
   - "Decode" button triggers search
   - Displays single result card or "not found" card

2. **Bulk Decode Tab** (`#panel-bulk`)
   - Textarea for pasting full ingredient lists
   - "Decode All" button triggers batch parsing
   - "Clear" button resets input and results
   - Displays statistics bar, alert banners, and categorized result sections

## Data Schemas

### Pigment Entry Object

Each pigment in the `PIGMENTS` array follows this schema:

```javascript
{
  id: 'pigment_blue_15',           // string - Unique identifier
  name: 'Pigment Blue 15',         // string - Primary display name
  ci: 'CI 74160',                  // string | null - Colour Index number
  cas: ['147-14-8'],               // string[] - CAS registry numbers (always array)
  inci: 'CI 74160',                // string | null - INCI name
  color_group: 'blue',             // string - Category: blue, green, violet, red, orange, yellow, black, white, additive, metal_impurity, amine
  status: 'banned',                // string - One of: banned, restricted, watch, svhc, safe
  status_label: 'Banned',          // string - Human-readable status description
  regulation: 'EU 2020/2081',      // string | null - Applicable regulation reference
  limit_ppm: null,                 // number | null - Maximum concentration in µg/g (ppm)
  notes: 'Phthalocyanine blue...', // string - Regulatory notes and explanation
  also_known_as: [                 // string[] - Alternative names/aliases
    'Phthalocyanine Blue',
    'Copper Phthalocyanine',
    'PB15',
    'Phthalo Blue'
  ],
  found_in: [                      // string[] - Typical ink applications
    'blue tattoo inks',
    'turquoise inks',
    'green blends'
  ],
  echa_url: 'https://echa.europa.eu/...'  // string - ECHA substance page URL
}
```

### Status Configuration

```javascript
const STATUS_CONFIG = {
  banned:     { icon: '🚫', cls: 'danger',  label: 'Banned' },
  restricted: { icon: '⚠️', cls: 'warning', label: 'Restricted' },
  watch:      { icon: '👁️', cls: 'watch',   label: 'Under Review' },
  svhc:       { icon: '⚗️', cls: 'danger',  label: 'SVHC' },
  safe:       { icon: '✅', cls: 'safe',    label: 'No restriction' },
};
```

### Search Index Entry

```javascript
{
  key: '147148',           // string - Normalized search key
  entry: { /* PigmentEntry */ }  // Reference to full pigment object
}
```

### Bulk Scan Result Object

```javascript
{
  query: 'CI 74160',       // string - Original matched text
  type: 'ci',              // string - Match type: 'cas', 'ci', or 'name'
  substance: { /* PigmentEntry */ } | null  // null for unrecognized ingredients
}
```

## Calculation / Logic Algorithms

### `normalizeCi(s)`

Strips whitespace and colons from CI numbers for flexible matching.

```javascript
// Input:  'CI 74160'  →  'CI74160'
// Input:  'CI 74160:3'  →  'CI741603'
```

### `normalizeName(s)`

Normalizes pigment names by lowercasing and removing separators.

```javascript
// Input:  'Pigment Blue 15'  →  'pigmentblue15'
// Input:  'Phthalo Blue'     →  'phthaloblue'
```

### `findPigmentByQuery(query)`

Performs four-stage matching against the `PIGMENT_INDEX`:

1. **Exact CAS match** - If query matches `\d{1,7}-\d{2}-\d` pattern, searches for exact CAS string
2. **CI number match** - If query matches `CI \d{4,6}` or `\d{4,6}`, normalizes and searches CI index
3. **Exact name/alias match** - Normalizes query and searches all name fields
4. **Partial name match** - If query length >= 4, searches for substring match in normalized names

Returns the first matching `PigmentEntry` object, or `null`.

### `parseInkIngredients(text)`

Parses bulk ingredient text through three extraction passes:

1. **CAS extraction** - Regex `/\b(\d{1,7}-\d{2}-\d)\b/g` finds all CAS numbers, looks up each in `PIGMENTS` array
2. **CI extraction** - Regex `/\bci\s*(\d{4,6})\b/gi` finds CI number references, looks up via `PIGMENT_INDEX`
3. **Name extraction** - Splits text on commas, newlines, and semicolons; runs `findPigmentByQuery` on each segment (skips lines that are purely numeric)

Deduplication uses a `Set` keyed by pigment `id` for matched entries or normalized query string for unknowns.

### `buildResultCard(pigment, query, matchType)`

Constructs a collapsible result card DOM element with:

- Status icon and badge (color-coded by `STATUS_CONFIG`)
- Pigment name, CI number, and CAS numbers
- Concentration limit badge (if `limit_ppm` exists)
- Regulation badge (if `regulation` exists)
- Detail grid showing status, color group, regulatory notes, and match method
- "Found in" and "Also known as" tag lists
- Action links to ECHA registry and EU regulation text
- Click-to-expand behavior via `toggleCard()`

### `buildNotFoundCard(query)`

Creates a simple card indicating the query was not found in the restricted pigments database.

### `renderSection(container, hits, title, autoExpand, isUnknown)`

Groups result cards under a section header. When `autoExpand` is true, the first card in the section is expanded. `isUnknown` flag uses `buildNotFoundCard` instead of `buildResultCard`.

## API Reference

### Public Functions

| Function | Parameters | Returns | Description |
|----------|------------|---------|-------------|
| `findPigmentByQuery(query)` | `query: string` | `PigmentEntry | null` | Searches database by CAS, CI, or name |
| `parseInkIngredients(text)` | `text: string` | `Array<{query, type, substance}>` | Parses bulk ingredient text into matched/unmatched results |
| `runSearch()` | None | `void` | Reads search input, finds pigment, renders result |
| `runBulkScan()` | None | `void` | Reads bulk input, parses ingredients, renders statistics and sections |
| `toggleCard(headerEl)` | `headerEl: HTMLElement` | `void` | Toggles expanded state on result card |

### Event Handlers

| Handler | Element | Event | Behavior |
|---------|---------|-------|----------|
| Tab click | `.tab-btn` | `click` | Switches active tab and panel |
| Enter key | `#search-input` | `keydown` | Triggers `runSearch()` on Enter |
| Click | `#search-btn` | `click` | Triggers `runSearch()` |
| Click | `#bulk-scan-btn` | `click` | Triggers `runBulkScan()` |
| Click | `#bulk-clear-btn` | `click` | Clears input and resets results |
| Click | `.card-header` | `click` | Toggles card expansion |

### Internal Helpers

| Function | Description |
|----------|-------------|
| `normalizeCi(s)` | Strips whitespace and colons from CI strings |
| `normalizeName(s)` | Lowercases and removes separators from names |
| `escHtml(str)` | Escapes HTML entities (`&`, `<`, `>`, `"`) for safe rendering |
| `renderIdle(msg)` | Returns HTML string for idle/empty state display |

## Integration Guide

### Standalone Embedding

The tool is fully self-contained and can be embedded via iframe:

```html
<iframe 
  src="https://poliinternational.com/tools/ink-ingredient-decoder/"
  width="100%" 
  height="800" 
  frameborder="0"
  title="Tattoo Ink Ingredient Decoder">
</iframe>
```

### Theme Integration

The tool supports parent-frame theme synchronization. When loaded in an iframe, it listens for `postMessage` events:

```javascript
// Parent frame sends theme updates
iframe.contentWindow.postMessage({
  type: 'poli-theme',
  light: true  // or false for dark mode
}, '*');
```

When embedded, the tool automatically applies dark theme by default and responds to theme messages from the parent.

### Dependencies

Zero external dependencies. The tool requires:
- `pigment-data.js` (must load before `app.js`)
- `style.css`

## Customization

### Adding New Pigments

Extend the `PIGMENTS` array in `pigment-data.js`:

```javascript
{
  id: 'pigment_red_999',        // Unique identifier
  name: 'Pigment Red 999',      // Display name
  ci: 'CI 99999',               // CI number or null
  cas: ['12345-67-8'],          // Array of CAS numbers
  inci: 'CI 99999',             // INCI name or null
  color_group: 'red',           // Category for grouping
  status: 'banned',             // banned | restricted | watch | svhc | safe
  status_label: 'Banned',       // Human-readable status
  regulation: 'EU 2020/2081',   // Regulation reference or null
  limit_ppm: null,              // Concentration limit or null
  notes: 'Description...',      // Regulatory notes
  also_known_as: ['Alias 1'],   // Alternative names
  found_in: ['red inks'],       // Application contexts
  echa_url: 'https://...'       // ECHA substance URL
}
```

### Styling

All visual customization is in `style.css`. The tool uses CSS custom properties for theming. Key variables:

```css
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --text-primary: #1a1a2e;
  --text-muted: #6c757d;
  --danger: #dc3545;
  --warning: #ffc107;
  --watch: #17a2b8;
  --safe: #28a745;
}
```

## Performance

- **Dataset size**: ~120 pigment entries, each ~500 bytes = ~60KB total data
- **Search index**: Built once at load time, ~400 normalized keys
- **Search complexity**: O(n) linear scan of index (n ≈ 400)
- **Bulk parsing**: O(m + n) where m = characters in input, n = extracted tokens
- **DOM operations**: Minimal - cards created only on user action, not pre-rendered
- **Memory**: Single-page application, no persistent state beyond DOM

## Browser Compatibility

- **Modern browsers**: Chrome 60+, Firefox 55+, Safari 11+, Edge 79+
- **ES6 features used**: `const`, `let`, arrow functions, template literals, `classList`, `forEach`, `includes`, `matchAll`
- **No polyfills required** for target browsers
- **CSS**: Flexbox, CSS custom properties, `:root` selector
- **Not tested on**: Internet Explorer, legacy mobile browsers

## Security

### Input Handling

All user input is HTML-escaped before DOM insertion using `escHtml()`:

```javascript
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

This prevents XSS attacks through:
- Pigment names containing HTML
- CAS numbers with embedded scripts
- Bulk input with malicious content

### Additional Security Measures

- **No server communication**: All processing is client-side
- **No cookies or localStorage**: Zero persistent data storage
- **No external resources**: All assets are self-hosted
- **No eval() or innerHTML for dynamic content**: Uses `textContent` for user data, `innerHTML` only for controlled template strings with escaped variables
- **Iframe protection**: `X-Frame-Options` not explicitly set, but tool includes `noindex, nofollow` meta tag

## Version History

### 1.0.0 (2026-01-15)
- Initial release
- Single pigment search by name, CAS, or CI number
- Bulk ingredient list parsing with regex extraction
- Database of ~120 restricted/regulated substances
- EU 2020/2081 and EU 2023/1545 compliance checking
- Collapsible result cards with detailed regulatory information
- Statistics bar and alert banners for bulk scans
- Iframe embedding support with theme synchronization

## Support and Contact

For technical issues, data corrections, or feature requests:

- **Email**: support@poliinternational.com
- **Website**: https://poliinternational.com
- **Regulation source**: [EU 2020/2081](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32020R2081)
- **ECHA database**: [Substances restricted under REACH](https://echa.europa.eu/substances-restricted-under-reach)
