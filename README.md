# Na lovu (The Chase)

Webová aplikace pro školní soutěž ve stylu televizní hry "Na lovu" (anglicky "The Chase"). Systém podporuje tři různé rozhraní pro moderátora, soutěžícího a lovce, vše v reálném čase pomocí WebSockets.

## 🎯 Funkce

- **Moderátorské rozhraní** - Ovládání hry, odesílání otázek, sledování odpovědí
- **Rozhraní soutěžícího** - Odpovídání na otázky, sledování skóre a pozice
- **Rozhraní lovce** - Odpovídání na otázky, honění soutěžícího
- **Tři herní módy:**
  - Peněžní honba (Cash Builder) - Soutěžící sbírá peníze
  - Souboj tváří v tvář (Head-to-Head) - Soutěžící vs. Lovec
  - Finální honba (Final Chase) - Tým vs. Lovec
- **Real-time synchronizace** - Všechna rozhraní jsou synchronizována v reálném čase

## 🚀 Instalace

1. Naklonujte repozitář:
```bash
git clone https://github.com/mchyla7/na-lovu.git
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

4. Otevřete v prohlížeči:
- Výběr role: `http://localhost:3000`
- Moderátor: `http://localhost:3000/moderator`
- Soutěžící: `http://localhost:3000/contestant`
- Lovec: `http://localhost:3000/chaser`

## 🎮 Jak hrát

### Moderátor
1. Vyberte herní kolo (Peněžní honba, Souboj tváří v tvář, nebo Finální honba)
2. Zadejte otázku a tři možné odpovědi (A, B, C)
3. Klikněte na "Odeslat otázku"
4. Počkejte, až soutěžící a lovec odpoví
5. Odhalte správnou odpověď kliknutím na příslušné tlačítko
6. Systém automaticky aktualizuje skóre a pozice

### Soutěžící / Lovec
1. Čekejte na otázku od moderátora
2. Vyberte svou odpověď (A, B, nebo C)
3. Sledujte svou pozici a výsledek

## 🔧 Technologie

- **Node.js** - Backend server
- **Express** - Webový framework
- **Socket.IO** - Real-time obousměrná komunikace
- **HTML/CSS/JavaScript** - Frontend rozhraní

## 📝 Konfigurace pro produkci

Pro nasazení na veřejný server:

1. Nastavte proměnnou prostředí `PORT`:
```bash
export PORT=80
```

2. Nebo upravte port v souboru `server.js`

3. Pro běh na pozadí použijte PM2:
```bash
npm install -g pm2
pm2 start server.js
pm2 save
pm2 startup
```

## 🌐 Použití na více počítačích

1. Spusťte server na jednom počítači
2. Zjistěte IP adresu serveru (např. `192.168.1.100`)
3. Na ostatních počítačích otevřete prohlížeč a přejděte na:
   - Moderátor: `http://192.168.1.100:3000/moderator`
   - Soutěžící: `http://192.168.1.100:3000/contestant`
   - Lovec: `http://192.168.1.100:3000/chaser`

## 📄 Licence

ISC