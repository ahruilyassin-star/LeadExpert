# Fix: remove product-card emoji badges + duplicate "Añadir al carrito" button

**Store:** ESENCIAS DE DUBAI (`esencias-de-dubai-2.myshopify.com`)
**Theme:** live / published theme

## What was wrong

1. **Emoji badges on product cards** — small coloured badges were stamped on
   every product card: `♂ Hombre`, `♀ Mujer`, `◎ Unisex`, and the orange
   `🎁 Set`. They looked cluttered/unprofessional.
2. **Duplicate add-to-cart button** — each card showed *two* black buttons:
   the theme's own `AÑADIR AL CARRITO` (uppercase, with the bag icon) **and** a
   second custom `Añadir al carrito` (lowercase). The second one was redundant.

## Cause

Both came from custom JavaScript snippets loaded globally in
`layout/theme.liquid`:

```liquid
{%- render 'ed-gender-badges' -%}   <!-- injects the emoji badges -->
{%- render 'ed-quick-add' -%}       <!-- injects the duplicate cart button -->
```

- `snippets/ed-gender-badges.liquid` reads each product's tags and appends an
  emoji badge to the card.
- `snippets/ed-quick-add.liquid` appends a `.ed-qa-btn` button to every
  `.epg-card`.

## Fix

Neutralize both snippets so they render nothing. The native theme quick-add
button is unaffected and remains. See the corrected files in
[`theme/snippets/`](../theme/snippets/).

## How to apply it on the live store (Shopify admin)

> The Shopify API connection blocks automated writes to the **published**
> theme, so this has to be applied manually (or on a duplicate that you then
> publish). It's two small, safe edits.

1. Shopify admin → **Online Store → Themes**.
2. On your live theme click **⋯ → Edit code**.
3. In the left sidebar open **Snippets → `ed-gender-badges.liquid`**.
   Select all the contents, delete them, and paste the contents of
   [`theme/snippets/ed-gender-badges.liquid`](../theme/snippets/ed-gender-badges.liquid)
   (a comment). **Save.**
4. Open **Snippets → `ed-quick-add.liquid`**, do the same with
   [`theme/snippets/ed-quick-add.liquid`](../theme/snippets/ed-quick-add.liquid).
   **Save.**
5. Refresh the storefront — the emoji badges and the duplicate button are gone.

> Prefer to be safe? **Duplicate** the live theme first (⋯ → Duplicate), make
> the two edits on the copy, preview it, then **Publish** the copy.

To undo at any time, revert the two snippet files to their previous contents.
