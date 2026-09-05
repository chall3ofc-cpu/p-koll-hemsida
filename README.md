# P-Koll: Smarta Parkering

Create a highly polished, premium, mobile-first Progressive Web App (PWA) interface for "P-Koll" - a smart parking assistant. The UI must feel like a high-end native mobile app (resembling Apple Maps or Uber, but darker and ultra-modern). Max-width container centered on desktop screens to simulate a mobile viewport. 

Color palette: Deep Slate-950 background, Emerald-500 (success/free), Amber-500 (warning/tariffs), Sky-500 (primary actions), and Rose-500 (restrictions/cleaning days). High contrast, gorgeous typography, smooth micro-interactions, and spring animations for all transitions. All visible UI text must be in Swedish.

Key Sections & Navigation (Floating Premium Bottom Tab Bar):
1. Karta (Default)
2. Mitt Konto
3. Info & Hjälp

--- SECTION 1: MAP SCREEN (THE HUB) ---
• Header Area:
  - A floating, backdrop-blur search bar: "🔍 Sök adress, gata eller stad...".
  - A beautiful profile icon button on the right that smoothly switches to "Mitt Konto".
• Main Area (Map Canvas Placeholder):
  - Do NOT render a real map or a simple grid. Create a beautiful, dark abstract canvas representing a map view with a pulsing blue user location dot [🎯] and a prominent floating street label: "Vasagatan, Stockholm".
  - Include a floating GPS centering button.
  - Interactive Bottom Sheet (Sliding Panel): A native-feeling draggable bottom panel that contains the core app controls.
• Inside the Bottom Sheet:
  - Centered Status Card: Changes dynamically based on the Time Travel Slider.
    * Default (Slider at 0): Displays a prominent "🟡 Taxa 3 (20 kr/tim)" badge. Underneath, show a breakdown: "Just nu fram till 19:00. Efter 19:00: Gratis till måndag 09:00. Obs! Städdag torsdagar 08-12."
    * Future (Slider > 120 mins): Smoothly transitions to "🟢 Ledigt & Gratis!".
  - Quick App Links: Add two sleek, branded buttons below the status card to simulate opening external payment apps with pre-filled zone codes: [Betala med EasyPark] and [Betala med Parkster].
  - Growth Feature: Add a "Dela plats" button that opens a beautiful share-sheet mock ("Skicka den här gröna zonen till en vän via WhatsApp/SMS").
  - Time Travel Slider (Tidsresa): A premium horizontal range slider (0 to 240 mins) with clear step snap points (Nu, +1h, +2h, +3h, +4h) and a dynamic time badge ("Just nu" or "Framspolat till kl. HH:MM").
  - Primary Action: A massive, glowing call-to-action button labeled "📸 FOTA SKYLT (AI)". 
  - AI Camera Mock: Clicking the camera button triggers a beautiful full-screen overlay simulating a phone camera, followed by a gorgeous "AI Result Card" reading: "🟢 Ja, du får stå här! Men glöm inte P-skivan. Du måste flytta bilen senast kl. 14:15."

--- SECTION 2: MITTENOMRÅDET: MITT KONTO (PERSONALIZATION) ---
A premium, iOS-style settings container to customize the parking rules:
- Vehicle Type selector (Radio cards or dropdown: Bensin/Diesel, Elbil, MC, Lastbil). If Elbil is active, display a subtle success message: "Laddplatser kommer nu lysa GRÖNT på kartan."
- Resident Parking (Boendeparkering): Input fields for Kommun (e.g., Stockholm) and Zon (e.g., Vasastan). Explain that this turns matching streets green.
- Accessibility Permit (Handikapptillstånd): A sleek toggle switch.
- A premium "Spara & Gå till Karta" action button.

--- SECTION 3: MITTENOMRÅDET: INFO & HJÄLP ---
A modern help center dashboard:
- Felrapportering: A clean, quick form to report incorrect parking rules on a street.
- Quick Rules Guide: An accordion-style list explaining common Swedish parking signs.
- For Partners: "P-Koll för tidningar & kommuner" - show a beautiful mock preview of a "Cleaning Day Widget" (Städdag-widget) that local newspapers can embed, alongside contact email info@p-koll.se.

Keep the map placeholder area completely clean of heavy external elements so we can easily inject real Mapbox/Google Maps code into it using Visual Studio Code later.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/eae55a0b-77b3-49fc-8e84-511e98d10094).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
