# Bsaha V1 (P0 + P1)

Base SaaS Next.js 14 pour le programme Bsaha.

## Stack

- Next.js 14 App Router + TypeScript + Tailwind
- Supabase (Auth, Postgres, Storage)
- Stripe Checkout + webhook
- Resend pour emails transactionnels

## Setup local

1. Copier `.env.example` vers `.env.local`
2. Renseigner toutes les variables
3. Installer les dependances: `npm install`
4. Lancer l'app: `npm run dev`

## Migrations Supabase

- Fichier initial: `supabase/migrations/20260508_init_bsaha.sql`
- Seed contenu: `supabase/migrations/20260508_seed_content.sql`
- Admin features: `supabase/migrations/20260508_admin_features.sql`
- Storage policies consultations: `supabase/migrations/20260508_storage_consultations_policies.sql`
- Projections + lives: `supabase/migrations/20260509_projections_lives.sql`
- Lead magnet + `live_reminders`: `supabase/migrations/20260510_v15_lead_magnet_cron.sql`
- Dedup envoi rappel relevé: `supabase/migrations/20260511_v16_daily_log_reminders.sql`
- Appliquer via Supabase CLI ou SQL Editor.

## Routes principales

- Public: `/`, `/inscription`, `/connexion`, `/ebook-gratuit`, `/mentions-legales`
- Portail: `/dashboard`, `/videos`, `/videos/[slug]`, `/ebooks`, `/suivi`, `/calendrier`
- Consentement: `/consentement`
- Admin (is_admin requis): `/admin/deals`, `/admin/consultations`, `/admin/lives`
- Notes de consultation: acces via `GET /api/consultations/[id]/notes` (URL signee, membre proprietaire uniquement ou admin)

## Stripe

- Checkout endpoint: `POST /api/stripe/checkout`
- Webhook endpoint: `POST /api/webhooks/stripe`
- Events geres: `checkout.session.completed`, `invoice.payment_failed`

## Deploiement Vercel

1. Importer le repo dans Vercel
2. Ajouter variables de `.env.example` dans Project Settings
3. Configurer webhook Stripe vers:
   - `https://<votre-domaine>/api/webhooks/stripe`
4. Verifier Supabase Auth URL et redirect URLs.

## Tests

- Lancer `npm run test`
- Couvre regles critiques:
  - seuil completion video (80%)
  - mapping douleur -> couleur calendrier
  - cle d'unicite releve quotidien
  - validation stricte des payloads API (Zod)
  - score progression + grille calendaire helpers

## Securite applicative

- Validation serveur des formulaires `daily_logs`, `calendar_notes`, `video_progress`
- Verification signature Stripe dans le webhook
- Protection middleware: session requise + consentement requis
- Protection admin: session + consentement + `users.is_admin = true`
- RLS Supabase active sur les tables utilisateurs
- Logs structures JSON pour auth, API et Stripe webhook
- PDFs consultations stockes en bucket prive `consultations`; URL signee courte generee a la demande

## V1.5 : graphiques suivi + lead magnet + rappels live

- **Graphiques /suivi** : Recharts (douleur courbe / transit Bristol + nombre de selles) sur les 30 derniers jours
- **Lead magnet** (`/ebook-gratuit`) : `POST /api/lead-magnet/ebook`, enregistrement `lead_magnet_submissions`, e-mail avec lien PDF signe Supabase (**72 h**).
  - Migr. : `supabase/migrations/20260510_v15_lead_magnet_cron.sql`
  - Variables : `LEAD_MAGNET_EBOOK_BUCKET`, `LEAD_MAGNET_EBOOK_PATH` ou premier ebook `is_free` dans la base
- **Cron rappels live** : `GET /api/cron/live-reminders` (protection `Authorization: Bearer ${CRON_SECRET}`)
  - Fenetre envoi : live dans **55–65 min** selon UTC
  - Destinataires : membres avec `access_active = true` et `consent_signed_at` renseigne
  - Dedoublonnage table `live_reminders`
  - **Vercel** : declarer `CRON_SECRET` dans les variables d environnement projet ; cron defini dans `vercel.json` pour les rappels live : **1 fois par jour a 9:00 UTC** (`0 9 * * *`, compatible plan gratuit). La route ne regarde qu une fenetre courte autour de cette heure ; pour des lives a d autres moments, elargir la fenetre dans le code ou ajuster l heure du cron.

Tests : `tests/live-reminders.test.ts`.

## V1.6 : progression, calendrier mensuel et rappel relevé quotidien

- **Dashboard** : score global /100 (+ détail Vidéos 40, Ebooks 30, Relevés 30 rolling **14 derniers jours** distincts UTC)
  - Fonction métier : `src/server/progression-score.ts`
- **Calendrier** : grille mensuelle `?m=YYYY-MM`, navigation préc./suiv., couleurs par douleur, **point sage** annotation/note, détail jour `?detail=YYYY-MM-DD`
  - `POST /api/calendar-notes` redirige vers `?m&detail=...`
  - Helpers : `src/server/calendar-grid.ts`
- **Cron rappel relevé quotidien** : `GET /api/cron/daily-log-reminders` (Bearer `CRON_SECRET`)
  - Référence date **Europe/Paris** pour la journée cible (`calendarDateParis`), une trace par utilisateur/date via `daily_log_reminder_sent`
  - Vercel défaut : tous les jours à **17:30 UTC** (voir `vercel.json`; ajuster timezone si besoin)
- Tests : `tests/progression-score.test.ts`, `tests/calendar-grid.test.ts`

## Checklist securite Storage consultations

1. Appliquer la migration `20260508_storage_consultations_policies.sql`
2. Verifier que le bucket `consultations` est `public = false`
3. Verifier limite 10MB et MIME autorise `application/pdf`
4. Verifier qu'aucune policy `select` permissive n'existe sur `storage.objects` pour ce bucket
5. Verifier upload possible uniquement pour un compte `is_admin = true`
6. Verifier acces membre uniquement via `GET /api/consultations/[id]/notes` (URL signee TTL court)
