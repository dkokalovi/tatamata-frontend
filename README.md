# TataMata - Frontend

Frontend za TataMata aplikaciju - Vue 3 (Vite) korisničko sučelje za upload fotografije
građevinskog problema, prikaz AI dijagnoze i preporuku obrta.

Backend za ovaj frontend je odvojen repozitorij: **tatamata-backend** (Express API), mora
raditi istovremeno da bi aplikacija funkcionirala.

## Tehnologije

- Vue 3 (Vite)
- Vue Router
- Bootstrap 5
- Axios

## Pokretanje

Potreban je Node.js (18+) i pokrenut **tatamata-backend** (vidi taj repozitorij za upute).

```bash
npm install
npm run dev
```

Frontend se pokreće na `http://localhost:5173`. Zahtjevi prema `/api` i `/uploads` se
automatski proxiraju na backend - vidi `vite.config.js`. Ako backend radi na drugom
portu/adresi od defaultnog `http://localhost:5050`, promijeni to u `vite.config.js`
(`server.proxy`).

Za testiranje na mobitelu preko lokalne mreže: `npm run dev -- --host`, pa otvori ispisanu
"Network" adresu na mobitelu (mobitel i računalo moraju biti na istoj WiFi mreži). U tom
slučaju backend mora u svom `CLIENT_ORIGIN` (.env) imati i tu mrežnu adresu, ne samo
`localhost`.

## Struktura

```
src/
├── main.js              # ulazna tocka, montira Vue app
├── App.vue               # korijenska komponenta, navigacijska traka
├── api.js                 # axios instanca s JWT interceptorom + imageUrl() helper
├── router/index.js        # rute + auth guard
└── views/
    ├── Auth.vue            # login / registracija
    ├── Home.vue            # upload fotografije, prikaz AI rezultata, povijest
    └── Admin.vue           # admin panel (korisnici, analize, interesi, firme)
```

## Autentikacija i zaštićene fotografije

JWT token se sprema u `localStorage` nakon logina i automatski dodaje u `Authorization`
header svakog API poziva (vidi `api.js`). Budući da backend sad štiti i fotografije
(`/uploads/:filename` traži autorizaciju), `<img>` tagovi ne mogu poslati taj header
direktno - zato `api.js` izvozi pomoćnu funkciju `imageUrl(path)` koja doda token kao
`?token=` query parametar na URL slike. Uvijek koristi tu funkciju za prikaz fotografija
iz backend odgovora, ne putanju iz baze direktno.
