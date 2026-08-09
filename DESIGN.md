# DESIGN.md — Minecraft Skill Test Tierlist

## Direction contract

**THESIS:** A Minecraft skill-test leaderboard rendered as if it were an in-game
screen — blocky, pixel-lettered, slot-based — refusing the generic dark
"esports leaderboard" template. The ranking is the product; the interface should
feel like opening the game's own results panel.

**OWN-WORLD:** Minecraft in-game UI. Palette: cave-dark stone ground
(`#0d0f12`/`#161a1f`), grass-green accent (`#5fbb3a`), gold/silver/bronze for
top-3 ranks, dirt-brown and lapis-blue secondary surfaces. Components are
right-angled (no border-radius), with 2–3px beveled borders (light top/left,
dark bottom/right) like inventory slots. Score fills use the XP-bar idiom.

**STORY:** A visitor lands, sees the ranked batch immediately (#1 at top with a
gold medal), filters by the six tested skills or penance, clicks any player to
see their full six-skill breakdown with platform equalization applied, and can
search by name. Everything reads as "the game made this."

**FIRST VIEWPORT:** Full-bleed title bar with pixel logo + animated floating
block particles. Below: a row of blocky category tabs (Overall / Raw PvP /
Building / Redstone / Ice Boat / Trap Box / FFA BR / Penance). Then the ranked
list — medal for top 3, skin-head avatar, pixel username, XP-bar score fill,
platform badge. Search sits above the list.

**FORM:** Replacement visual world for an incumbent flat leaderboard. Committed
Minecraft in-game UI throughout; no rounded corners, no glass, no gradient text.
Fonts: "Press Start 2P" for display/labels (used sparingly for legibility),
"Inter" for body/numbers. Dark theme primary, light "plains" theme toggle.

## Durable system rules

- Right angles only. `border-radius: 0` everywhere. Bevels via box-shadow insets.
- Accent is grass-green; it carries headers, active tabs, focus rings, and the
  top of the XP bar. Gold/silver/bronze are reserved for rank #1/#2/#3 only.
- Platform badges: PC = stone gray, Pojav KBM = lapis blue, Pojav Touch = sand
  gold. Each shows its equalization multiplier.
- Avatars: `https://mc-heads.net/avatar/{username}/40` with a colored initials
  block fallback when the image fails or is offline.
- Motion: one authored moment — rank rows rise into place on load/category
  switch with an exponential ease-out; hover lifts a row 2px. No scattered effects.
- Equalization: `pc 1.00x`, `pojav_kbm 1.02x`, `pojav_touch 1.08x` applied to
  each raw skill before averaging into Overall. Penance is separate, never
  averaged into Overall.

## Data model (data.json)

```
players[]: { username, platform: "pc"|"pojav_kbm"|"pojav_touch",
             scores: { raw_pvp, building, redstone, ice_boat, trap_box, ffa_br },
             penance? }
```
Overall = round(mean of 6 equalized scores). Ranked #1..N per active category.
