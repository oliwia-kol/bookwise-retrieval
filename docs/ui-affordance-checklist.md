# UI Affordance Checklist

## Design Sweep Checklist
- [ ] **Header** (Top navigation + hero header group): verify saturation/contrast, warmth, and hover/active affordances.
- [ ] **CTA** (Primary/secondary call-to-action buttons group): verify saturation/contrast, warmth, and hover/active affordances.
- [ ] **Source Cards** (Chat source card group): verify saturation/contrast, warmth, and hover/active affordances.
- [ ] **Chat Bubbles** (Assistant/user bubble group): verify saturation/contrast, warmth, and hover/active affordances.
- [ ] **Final Sweep** (Global polish pass on layout accents group): verify saturation/contrast, warmth, and hover/active affordances.

## EvidenceCard (`src/components/EvidenceCard.tsx`)
- [x] Saturation/contrast: glow-primary-subtle and gradient-warm overlay keep content readable against `--card-foreground`.
- [x] Warmth presence: gradient-warm overlay reinforces warm brand tone without overpowering text.
- [x] Hover/active clarity: hover-lift + hover-glow amplify affordance; selected ring remains distinct.

## SourceCard (`src/components/chat/SourceCard.tsx`)
- [x] Saturation/contrast: text remains anchored to `--card-foreground` with muted publisher accents.
- [x] Warmth presence: gradient-warm overlay provides a subtle warm sheen at hover.
- [x] Hover/active clarity: hover-lift + hover-glow clearly communicate interactivity.
