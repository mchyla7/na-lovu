# Na lovu (The Chase) – školní realtime hra

Tento projekt poskytuje jednoduchou webovou aplikaci pro soutěž ve stylu TV hry **"Na lovu" (The Chase)**. Běží na Node.js + Socket.IO a umožňuje tři oddělené role na třech počítačích:

1. Moderátor – zakládá/připojuje místnost, zadává otázky, vyhodnocuje odpovědi.
2. Soutěžící – vidí otázky a odesílá vlastní odpověď.
3. Lovec – vidí otázky a snaží se porazit soutěžícího.

## Funkce

- Vytvoření místnosti s kódem (např. **ABCD1**)
- Připojení soutěžícího a lovce podle kódu
- Otázky typu otevřená odpověď nebo výběr z možností (multi-choice)
- Zamknutí odpovědi (po jednom pokusu)
- Ruční nebo automatické vyhodnocení (u výběru z možností se hodnotí automaticky)
- Přičítání bodů za správné odpovědi
- Realtime synchronizace stavů přes WebSocket (Socket.IO)

## Struktura

```text
src/
	server.js        # Express + Socket.IO server
	gameState.js     # Správa stavů místností a otázek
public/
	index.html       # Připojení do role soutěžící/lovec, odkaz na moderátora
	moderator.html   # Panel moderátora
	contestant.html  # Klient soutěžícího
	chaser.html      # Klient lovce
	styles.css       # Jednoduché UI
Dockerfile
docker-compose.yml
```

## Rychlé spuštění (lokálně)

Potřebujete Node.js (doporučeno 18+).

```bash
npm install
npm start
```

Otevřete prohlížeč na `http://localhost:3000`.

## Docker

Build + run:

```bash
docker build -t na-lovu .
docker run -p 3000:3000 na-lovu
```

Nebo pomocí `docker-compose`:

```bash
docker compose up --build
```

## Použití ve hře

1. Moderátor otevře `http://SERVER:3000/moderator.html` a vytvoří místnost (nebo se připojí k již existující). Zobrazí se kód místnosti.
2. Soutěžící a Lovec na svých počítačích otevřou `http://SERVER:3000/`, zadají kód a svoje jméno a připojí se jako **Soutěžící** resp. **Lovec**.
3. Moderátor zadá otázku: otevřenou (libovolný text) nebo výběr z možností (zaškrtne „Výběr z možností“ a doplní varianty + index správné odpovědi).
4. Soutěžící a Lovec odešlou odpovědi (u výběru z možností kliknou na tlačítko; u otevřené vyplní text). Odpověď se po odeslání zamkne.
5. Moderátor buď ručně označí správnost (u otevřené otázky) a stiskne „Potvrdit skóre“, nebo u výběru z možností prostě dá „Vyhodnotit / ukončit“ – skóre se přidá automaticky.
6. Skóre se průběžně aktualizuje. Postupně můžete pokládat další otázky.

## Bezpečnost a omezení

- Stav je v paměti – po restartu serveru se vše smaže.
- Není implementováno ověření identity ani trvalé logování.
- Wi-Fi/lan latence může ovlivnit „rychlost“ závodu – pro školní účely zpravidla stačí.

## Možné rozšíření

- Více místností najednou (aktuálně podporováno, ale UI neumožňuje listování)
- Statistiky po skončení hry
- Časovač a automatické uzavření odpovědí
- Role publika (jen sledování)
- Persistované výsledky (databáze)

## Licence

Projekt určen pro školní nekomerční použití. Můžete upravit dle potřeb.

---
Pokud chcete další funkce (např. automatický časovač s odpočtem na frontend, více kol, různou bodovou hodnotu otázek), napište a můžeme doplnit.
