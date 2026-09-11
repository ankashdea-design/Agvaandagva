# KinderCare MN

Цэцэрлэгийн өдөр тутмын тайлангийн систем — Next.js + Supabase дээр бүтээгдсэн, ажилладаг MVP.

> ⚠️ **Энэ код nи AI орчинд (интернэтгүй sandbox) бичигдсэн тул `npm install` болон Supabase-тай холбогдох тест энд хийгдээгүй.** Кодыг татаад, доорх алхмуудыг дагаж, өөрийн машин дээр ажиллуулах шаардлагатай. Синтакс алдаа гарвал (ялангуяа TypeScript type-уудад) `npm run build` ажиллуулж олж засаарай — том codebase-ийг эхний удаад алдаагүй бичих боломжгүй тул энэ хэвийн үзэгдэл.

## 1. Юу хийгдсэн

- Next.js 14 (App Router) + TypeScript + Tailwind
- Supabase Auth (email/password) + PostgreSQL
- 3 role: `admin`, `teacher`, `parent` — middleware дээр route хамгаалалттай
- Бүрэн database schema + **Row Level Security** (parent зөвхөн өөрийн хүүхдийг, teacher зөвхөн өөрийн ангийг харна — DB level дээр хориглогдсон)
- Teacher dashboard: хайлт, шүүлтүүр, bulk actions, inline autosave editing, ирц
- Parent dashboard: multi-child switcher, өнөөдрийн статус card-ууд, түүх, мэдэгдэл
- Admin: dashboard stats, Children/Classes CRUD (soft-delete), Teacher/Parent invite (service-role API route)
- PWA (`next-pwa`) + offline queue (localStorage-д хадгалагдаж, онлайн болмогц sync хийгдэнэ)
- Seed script: 1 цэцэрлэг, 1 анги, 23 хүүхэд, 3 demo account

## 2. Юу дутуу / дараа нэмэх (шударгаар хэлэхэд)

- **Push notification** бодит илгээлт (`notifications` хүснэгт бэлэн, гэхдээ trigger/edge function холбоогүй)
- PWA icon файлууд (`public/icons/icon-192.png`, `icon-512.png`) — placeholder зам л тавьсан, өөрөө зураг байрлуулах хэрэгтэй
- Parent-Child холболтыг admin UI-аас хийх дэлгэрэнгүй CRUD (одоогоор seed script дотор л хийгдсэн; DB бэлэн, UI нэмэх ажил үлдсэн)
- Automated тест (Playwright/Vitest) бичигдээгүй — доорх QA checklist-ийг гараар туршина уу

## 3. Шаардлага

- Node.js 18+
- Supabase акаунт (үнэгүй tier хангалттай): https://supabase.com

## 4. Суулгах

```bash
npm install
cp .env.example .env.local
```

## 5. Supabase тохиргоо

1. https://supabase.com дээр шинэ project үүсгэ.
2. **Settings → API** хэсгээс дараах утгуудыг `.env.local`-д хуул:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (**зөвхөн seed script болон `/api/admin/invite` route дотор ашиглагдана — хэзээ ч client code-д бүү дэлгэ**)
3. **Authentication → Providers** дээр Email нэвтрэлт идэвхтэй эсэхийг шалга (default-аар идэвхтэй байдаг).
4. **Authentication → Email Templates** дээр "Confirm signup" шаардлагагүй болгохын тулд, эсвэл `email_confirm: true` ашигладаг тул seed/invite скриптүүд аль хэдийн баталгаажуулсан хэрэглэгч үүсгэнэ.

## 6. Database migration

Supabase CLI ашиглаж болно:

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

Эсвэл хамгийн энгийн арга — Supabase Dashboard → **SQL Editor** руу орж дараах 2 файлыг дараалан бүрэн copy-paste хийж Run дар:

1. `supabase/migrations/0001_schema.sql`
2. `supabase/migrations/0002_rls.sql`

## 7. Seed data (23 demo хүүхэд + 3 demo account)

```bash
npm install dotenv   # хэрэв аль хэдийн суусан бол алгасна
node scripts/seed.mjs
```

Энэ нь дараах зүйлийг үүсгэнэ:

- Kindergarten: "Наран цэцэрлэг"
- Class: "Бэлтгэл бүлэг" (23 хүүхэдтэй, spec дэх нэрсээр)
- Demo accounts (доор)

## 8. Demo нэвтрэх мэдээлэл

| Role | Email | Password |
|---|---|---|
| Admin | `admin@demo.mn` | `Demo1234!` |
| Teacher | `teacher@demo.mn` | `Demo1234!` |
| Parent | `parent@demo.mn` | `Demo1234!` (А. Амингоо-той холбогдсон) |

**Production дээр эдгээр demo нууц үгийг хэзээ ч ашиглахгүй.** Seed script-ийг зөвхөн dev/staging орчинд ажиллуул.

## 9. Хөгжүүлэлт

```bash
npm run dev
```

http://localhost:3000 → автоматаар `/login` руу redirect хийнэ.

## 10. Production build

```bash
npm run build
npm run start
```

## 11. Deploy (жишээ: Vercel)

1. Repo-г GitHub дээр push хий.
2. Vercel дээр import хий.
3. Environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) нэм.
4. Deploy.
5. Supabase **Authentication → URL Configuration** дээр production domain-аа `Site URL`-д нэм.

## 12. Project structure

```
app/
  (login, admin/, teacher/, parent/, api/admin/invite/)
components/
  ui/ (Button, Card, Badge)
  teacher/ nav/ parent/ admin/
lib/
  supabase/ (client, server, middleware)
  queries/ (teacher, parent, admin)
  auth/ (logout action)
  utils.ts
hooks/
  use-online-status.ts, use-offline-queue.ts
types/
  database.ts
supabase/
  migrations/0001_schema.sql, 0002_rls.sql
scripts/
  seed.mjs
```

## 13. QA checklist (гараар туршина)

- [ ] Parent login → зөвхөн өөрийн хүүхдийг харна
- [ ] Parent Network tab-аар өөр child_id бүхий query илгээж үзэх → RLS татгалзана (өгөгдөл хоосон ирнэ)
- [ ] Teacher login → зөвхөн assigned class-аа харна
- [ ] Teacher bulk action → 23 хүүхэд нэг дор шинэчлэгдэнэ, toast харагдана
- [ ] Нэг хүүхдийн status өөрчлөх → Save товч дарахгүйгээр шууд хадгалагдана
- [ ] Хуудас refresh хийхэд өгөгдөл хадгалагдсан хэвээр байна
- [ ] Admin → Children/Classes CRUD, soft-delete (is_active) ажиллана
- [ ] Mobile (390px) болон Desktop дээр UI эвдэхгүй
- [ ] Devtools → Network → Offline горимд teacher checkbox өөрчлөх → localStorage-д queue үүснэ, online болоход sync хийгдэнэ
- [ ] Unauthorized route (жишээ: parent `/admin` руу орох гэж оролдох) → өөрийн dashboard руу redirect хийнэ
