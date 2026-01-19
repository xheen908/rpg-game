**MMORPG-Framework** verschoben, die Terminologie angepasst (Open World, Stats, Persistence) und die Struktur nach Best Practices für skalierbare Online-Rollenspiele optimiert.

```markdown
# Cyber-Onyxia: 3D Online MMORPG

Ein hochperformantes, webbasiertes Massively Multiplayer Online Role-Playing Game (MMORPG) im Stil von World of Warcraft. Das Spiel basiert auf **React**, **Three.js (React Three Fiber)** und **Socket.io** und bietet eine persistente Welt mit Tab-Targeting-Kampfsystem.

## 🚀 Kern-Features (MMORPG-Fokus)

* **Persistente Spielwelt**: Synchronisierte Open-World-Umgebung für hunderte Spieler via Socket.io.
* **Persistent Data Storage**: Spielerprofile, Fortschritte und Einstellungen werden dauerhaft gespeichert. Daten müssen nur einmal eingegeben werden.
* **WoW-Style Tab-Targeting**: Intelligente Zielerfassung von NPCs und Spielern inklusive Unit-Frames (Lebensbalken, Porträts).
* **Klassen- & Stat-System**: Verwaltung von Gesundheit (HP), Ressourcen und Level-Fortschritt.
* **Prozedurale Cyber-Umgebung**: Dynamisch generierte Terrains und Strukturen mittels Canvas-Textur-Library.
* **Echtzeit-Interaktion**: Globaler Chat, Gruppen-Synchronisation und Movement-Validierung.

## 🛠 Tech Stack

* **Frontend**: React.js, Next.js (App Router).
* **3D Engine**: Three.js mit `@react-three/fiber` und `@react-three/drei`.
* **Networking**: Socket.io für bidirektionale Echtzeitkommunikation (Server-Authoritative-Ansatz).
* **Persistence Layer**: LocalStorage (Client) & Datenbank-Integration (Backend) für dauerhafte Speicherung.
* **UI Framework**: Custom CSS-in-JS für das MMORPG-Interface (Unit Frames, Castbars).

## 📂 Projektstruktur

| Datei | Funktion |
| :--- | :--- |
| `TexturedArena.js` | Main Game Engine & World Manager. Initialisiert die 3D-Welt. |
| `Player.js` | Controller für Charaktersteuerung, Kamera (3rd/1st Person) und Sync. |
| `TextureLibrary.js` | Generiert prozedurale Assets für die Welt (Grid-Böden, Cyber-Pfade). |
| `UnitFrames.js` | RPG-Interface für Spieler- und Ziel-Status (WoW-inspiriert). |
| `EscMenu.js` | Systemmenü für Einstellungen und Account-Verwaltung. |
| `ChatSystem.js` | Multiplex-Chat für globale Kommunikation. |

## 🕹 Steuerung & Mechaniken

* **W / A / S / D**: Charakterbewegung.
* **Leertaste**: Sprungmechanik.
* **Maus**: Kamera-Orbit & Steuerung (Pointer Lock).
* **TAB**: Nächstes Ziel erfassen (Tab-Targeting).
* **1 - 5**: Aktionsleiste / Fähigkeiten (in Entwicklung).
* **ENTER**: Chat aktivieren/senden.
* **ESC**: Menü öffnen / Ziel abwählen.

## 🛠 Installation & Setup

1. **Repository klonen**:
   ```bash
   git clone [https://github.com/dein-user/cyber-onyxia.git](https://github.com/dein-user/cyber-onyxia.git)
   cd cyber-onyxia

```

2. **Abhängigkeiten installieren**:
```bash
npm install

```


3. **Entwicklungsserver starten**:
```bash
# Startet Client und Socket-Server parallel
npm run dev

```



## 📈 Roadmap & Best Practices

* **Server-Side Validation**: Umzug der Kollisionsabfrage auf den Server zur Cheat-Prävention.
* **Database Persistence**: Erweiterung des Speichersystems auf eine externe Datenbank (MongoDB/PostgreSQL).
* **Asset Pipeline**: Integration von Low-Poly GLTF-Modellen für Rüstungen und Waffen.

---