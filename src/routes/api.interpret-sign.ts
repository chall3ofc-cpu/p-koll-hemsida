import { createAPIFileRoute } from "@tanstack/start/api";

export const Route = createAPIFileRoute("/api/interpret-sign")({
  POST: async ({ request }) => {
    try {
      const { image, time } = await request.json();
      const apiKey = process.env.OPENAI_API_KEY;

      if (!apiKey) {
        return new Response(
          JSON.stringify({
            isParkingSign: false,
            allowedNow: false,
            humanSummary: "Systemfel: AI-nyckeln är inte aktiverad på servern ännu.",
            nextEvent: ""
          }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      // Det skarpa, krypterade anropet till OpenAI:s vision-modell
      const response = await fetch("https://openai.com", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `Du är AI-motorn för parkeringsappen P-Koll. Analysera bilden.
                  Aktuell tidpunkt i Sverige: ${time}.

                  Följ dessa instruktioner stenhårt:
                  1. Om bilden INTE visar en svensk parkeringsskylt (t.ex. om det är ett ansikte, en människa, en selfie, ett rum eller ett random föremål), MÅSTE du svara med "isParkingSign": false.
                  2. Om det ÄR en parkeringsskylt, tolka texten och pilarna noggrant. Räkna ut om man får stå där JUST NU baserat på den angivna svenska tiden.

                  Svara exakt i detta JSON-format:
                  {
                    "isParkingSign": true eller false,
                    "allowedNow": true eller false,
                    "humanSummary": "En kort mänsklig sammanfattning på svenska (max 20 ord). Om det inte är en skylt, skriv 'Hittade ingen parkeringsskylt i bilden. Försök igen!'",
                    "nextEvent": "Tidsgräns eller viktig händelse (t.ex. 'Avgift startar kl. 09:00' eller 'Flytta bilen senast 18:00'). Lämna tom om det inte är en skylt."
                  }`
                },
                {
                  type: "image_url",
                  image_url: { url: image }
                }
              ]
            }
          ]
        })
      });

      const openAiData = await response.json();
      const aiResult = JSON.parse(openAiData.choices[0].message.content);

      return new Response(JSON.stringify(aiResult), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });

    } catch (error) {
      return new Response(
        JSON.stringify({
          isParkingSign: false,
          allowedNow: false,
          humanSummary: "Kunde inte tolka bilden. Försök igen med ett tydligare foto.",
          nextEvent: ""
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
  }
});
