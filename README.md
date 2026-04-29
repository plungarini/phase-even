# Phase

> _Read the hidden rhythm of your days._

Phase is an arcane biorhythm reader for Even Realities Glasses glasses. It computes the three classic sine-wave cycles — Physical (23 days), Emotional (28 days), and Intellectual (33 days) — from your birth date and displays them as a real-time HUD on your glasses and as a polished phone UI.

The app is upfront about its roots: biorhythm theory is **pseudoscience** with no empirical support. Phase treats it as historical folklore — a playful, atmospheric way to frame your day, not a medical or scientific tool.

## Key Features

- **Dual-layer display** — A React phone UI for setup and a native G2 HUD for at-a-glance readings.
- **Real-time biorhythm HUD** — Live clock, date, and three cycle rows (value, trend, day/period) rendered directly on the glasses.
- **Inline PNG charts** — Each cycle is visualised as a sine-wave chart with a position marker, generated on-device and sent to the glasses display.
- **Privacy-first storage** — Your birth date is stored only in the Even Hub bridge local storage on your phone. Never sent to a server.
- **Smart SDK rendering pipeline** — Uses `createStartUpPageContainer`, `rebuildPageContainer`, and `textContainerUpgrade` optimally to minimise redraws and power use.
- **Pixel-accurate layout** — Text alignment on the HUD is measured with `@evenrealities/pretext` to match the glasses firmware font metrics exactly.
- **Periodic tick** — The HUD refreshes every 30 seconds so the clock and date stay current without user interaction.

## How It Works / User Flow

1. **Launch** the app on your phone. You land on the _Today_ tab.
2. **Set your birth date** in the _Settings_ tab. It is saved to bridge storage instantly.
3. **On the phone** you see a composite score, individual cycle cards with sparkline charts, trend badges, and an explainer on how the pseudoscience works.
4. **On the glasses** the HUD boots automatically: a header with the current time and date, followed by three rows — Physical, Emotional, and Intellectual — each showing the current percentage, trend arrow, cycle day, and a tiny rendered chart.
5. **Double-click** the glasses touch area to close the HUD.

If no birth date is set, the glasses display a friendly prompt to configure it in the phone app.

## Tech Stack

| Layer        | Technology                                        |
| ------------ | ------------------------------------------------- |
| Language     | TypeScript                                        |
| Build tool   | Vite 8                                            |
| UI (phone)   | React 19 + Tailwind CSS 4                         |
| SDK          | `@evenrealities/even_hub_sdk` ^0.0.10             |
| CLI          | `@evenrealities/evenhub-cli` ^0.1.12              |
| Simulator    | `@evenrealities/evenhub-simulator` ^0.7.2         |
| Toolkit      | `even-toolkit` ^1.5.0 (PNG utils, canvas helpers) |
| Font metrics | `@evenrealities/pretext` ^0.1.4                   |
| Router       | `react-router` ^7                                 |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Generate a QR code for sideloading on your iPhone
npm run qr

# Build for production
npm run build

# Package as .ehpk for Even Hub distribution
npm run pack
```

## Why Phase Exists

Even Realities glasses are designed for ambient, glanceable information. Phase fills a niche no other Even Hub app addresses: **personal, atmospheric context** that changes slowly over time. Instead of notifications or task lists, Phase offers a quiet, rhythmic backdrop to your day — a conversation starter, a moment of reflection, and a nod to 1970s pseudoscience culture, all rendered in crisp 4-bit greyscale on your G2 lenses.

It is also a reference-quality example of a dual-layer Even Hub app: a rich phone UI paired with a highly optimised, image-capable HUD that respects SDK container limits, queues image sends sequentially, and handles layout changes gracefully.
