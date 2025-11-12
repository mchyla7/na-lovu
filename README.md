# Na lovu - Kvízová hra

## Přehled
Tento projekt je kvízová hra inspirovaná pořadem "Na lovu", která umožňuje moderátorovi nahrát otázky ve formátu JSON. Hra zahrnuje lovce a soutěžícího, kteří odpovídají na otázky s výběrem ze tří možností v časovém limitu 10 sekund.

## Struktura projektu
```
na-lovu
├── src
│   ├── server.ts               # Hlavní soubor aplikace
│   ├── types
│   │   └── index.ts            # Definice typů pro otázky a odpovědi
│   ├── routes
│   │   ├── admin.ts            # Admin rozhraní pro správu otázek
│   │   └── game.ts             # Herní rozhraní pro průběh hry
│   └── public
│       ├── index.html          # Hlavní vstupní stránka
│       ├── moderator.html      # Rozhraní moderátora pro nahrání otázek
│       ├── hunter.html         # Rozhraní lovce
│       ├── contestant.html     # Rozhraní soutěžícího
│       ├── css
│       │   └── style.css       # Styly aplikace
│       └── js
│           ├── moderator.js    # Logika pro rozhraní moderátora
│           ├── hunter.js       # Logika pro rozhraní lovce
│           └── contestant.js   # Logika pro rozhraní soutěžícího
├── uploads
│   └── .gitkeep                # Udržuje adresář uploads ve verzovacím systému
├── questions
│   └── example-questions.json  # Ukázkové otázky ve formátu JSON
├── package.json                # Konfigurace npm
├── tsconfig.json               # Konfigurace TypeScript
└── README.md                   # Dokumentace projektu
```

## Funkce

- **Nahrávání otázek**: Moderátoři mohou nahrát JSON soubor s otázkami, kde každá má tři možnosti odpovědí a určenou správnou odpověď.
- **Časovaná hra**: Soutěžící i lovec mají přesně 10 sekund na každou otázku, se synchronizovaným časem.
- **Více rozhraní**: Oddělené HTML stránky pro moderátory, lovce a soutěžící pro různé role ve hře.
- **Real-time synchronizace**: Všichni účastníci vidí stejnou otázku a časovač běží synchronně pomocí WebSocket.

## Formát JSON otázek

```json
{
  "questions": [
    {
      "id": 1,
      "question": "Jaké je hlavní město České republiky?",
      "options": ["Brno", "Praha", "Ostrava"],
      "correctAnswer": 1
    }
  ]
}
```

## Instalace

1. Naklonujte repozitář:
   ```bash
   git clone <url-repozitare>
   cd na-lovu
   ```

2. Nainstalujte závislosti:
   ```bash
   npm install
   ```

3. Spusťte server:
   ```bash
   npm start
   ```

4. Otevřete prohlížeč a přejděte na `http://localhost:3000`

## Použití

1. **Moderátor**: 
   - Otevře `/moderator.html`
   - Nahraje JSON soubor s otázkami
   - Spustí hru a řídí průběh

2. **Lovec**: 
   - Otevře `/hunter.html`
   - Vidí otázky a odpovídá současně se soutěžícím
   
3. **Soutěžící**: 
   - Otevře `/contestant.html`
   - Odpovídá na otázky v časovém limitu 10 sekund

## Pravidla

- Každá otázka má časový limit 10 sekund
- Soutěžící i lovec odpovídají současně
- Skóre se počítá automaticky
- Všechny displeje jsou synchronizované v reálném čase

## Příspěvky

Pokud chcete přispět k vylepšení hry, neváhejte vytvořit issue nebo pull request.

## Demo

Pro rychlou ukázku funkčnosti si můžete prohlédnout [toto video](https://www.youtube.com/watch?v=dQw4w9WgXcQ).

## Licence

Tento projekt je licencován pod licencí MIT - podrobnosti naleznete v souboru [LICENSE](LICENSE).
