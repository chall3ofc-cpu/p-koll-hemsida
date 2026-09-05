// Denna kod körs på servern och pratar med OpenAI
export async function interpretParkingSign(base64Image: string, currentDayTime: string) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      allowedNow: true,
      humanSummary: "AI-nyckel saknas! (Demoläge): Ja, du får stå här, men glöm inte P-skivan.",
      nextEvent: "Flytta bilen senast kl. 14:15."
    };
  }

  try {
    const response = await fetch("https://openai.com", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Snabbt, billigt och grymt på att läsa bilder
        response_format: { type: "json_object" }, // Tvinga OpenAI att svara i ren data
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Du är parkeringsassistenten P-Koll. Analysera denna bild.
                Viktigt: Om bilden INTE visar en svensk parkeringsskylt (t.ex. om det är ett ansikte, en människa eller ett godtyckligt objekt), måste du flagga det i JSON-svaret!
                
                Dagens tidpunkt: ${currentDayTime}
                
                Svara EXAKT i detta JSON-format:
                {
                  "isParkingSign": true eller false,
                  "allowedNow": true eller false,
                  "humanSummary": "Ett kort mänskligt svar på svenska (max 20 ord). Om det inte är en skylt, skriv 'Hittade ingen parkeringsskylt i bilden. Försök igen!'",
                  "nextEvent": "Vad händer näst? T.ex. 'Avgift startar kl 09:00' eller 'Städdag imorgon'."
                }`
              },
              {
                type: "image_url",
                image_url: {
                  url: base64Image // Här skickas din tagna bild med till AI:n
                }
              }
            ]
          }
        ]
      })
    });

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
  } catch (error) {
    console.error("OpenAI-fel:", error);
    return { isParkingSign: false, allowedNow: false, humanSummary: "Ett fel uppstod vid analysen.", nextEvent: "" };
  }
}
