# template-ts-vue3

Vue 3 + TypeScript + Vite template พร้อม Git Hooks (Husky)

## Project Setup

```sh
npm install
```

Hook จะถูกติดตั้งอัตโนมัติผ่าน `prepare` script (`husky`)

## Development

```sh
# dev server
npm run dev

# production build
npm run build

# type-check อย่างเดียว
npm run type-check

# format ทั้ง src/
npm run format
```

---

## Git Hooks (Husky)

โปรเจกต์ใช้ [Husky](https://typicode.github.io/husky/) รัน validation อัตโนมัติตาม lifecycle ของ Git

```
git commit
  ├─ pre-commit    → ตรวจโค้ดก่อน commit
  └─ commit-msg    → ตรวจรูปแบบ commit message

git push
  └─ pre-push      → รัน production build ทั้งโปรเจกต์
```

ไฟล์ hook อยู่ที่ `.husky/`

| Hook | ไฟล์ | รันเมื่อ |
|------|------|---------|
| Pre-Commit | `.husky/pre-commit` | `git commit` |
| Commit Message | `.husky/commit-msg` | หลัง pre-commit ผ่าน |
| Pre-Push | `.husky/pre-push` | `git push` |

---

### Pre-Commit (`[Git · Pre-Commit]`)

ตรวจ **ก่อน** commit สร้าง snapshot

| ขั้น | ตรวจอะไร | ขอบเขต |
|------|----------|--------|
| 1/4 Branch | ห้าม commit ตรงบน `main` / `master` | ทุก commit |
| 2/4 File naming | `.vue` → PascalCase, `.ts`/`.js` → camelCase | **เฉพาะไฟล์ staged** |
| 3/4 Prettier | จัด format อัตโนมัติ | **เฉพาะไฟล์ staged** |
| 4/4 TypeScript | `vue-tsc --build` | ทั้งโปรเจกต์ |

ตัวอย่างชื่อไฟล์ที่ถูกต้อง:

| นามสกุล | รูปแบบ | ตัวอย่าง |
|---------|--------|----------|
| `.vue` | PascalCase | `App.vue`, `UserProfile.vue` |
| `.ts` / `.js` | camelCase | `main.ts`, `useAuth.ts` |

---

### Commit Message (`[Git · Commit-Message]`)

บังคับ [Conventional Commits](https://www.conventionalcommits.org/)

```
<type>(<scope>): <description>
```

**Types ที่อนุญาต:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `build`, `ci`

ตัวอย่าง:

```text
feat(auth): add google login button
fix(cart): resolve total price calculation bug
chore(husky): add pre-commit hooks
```

---

### Pre-Push (`[Git · Pre-Push]`)

รัน `npm run build` ก่อน push ทุกครั้ง เพื่อยืนยันว่าโค้ดทั้งโปรเจกต์:

- type-check ผ่าน (`vue-tsc --build`)
- build production ผ่าน (`vite build`)

ช่วยจับ error ที่ `npm run dev` อาจไม่เจอ แต่ build แล้วระเบิด

---

## รัน Hook ด้วยตัวเอง (Manual)

ทดสอบ hook โดยไม่ต้อง commit/push จริง:

```sh
# pre-commit ทั้งชุด
sh .husky/pre-commit

# commit-msg (ต้องมีไฟล์ message)
echo "chore: test message" > /tmp/commit-msg.txt
sh .husky/commit-msg /tmp/commit-msg.txt

# pre-push (รัน build ทั้งโปรเจกต์)
sh .husky/pre-push
```

รัน validation แยกเป็นคำสั่ง npm:

```sh
npm run format        # prettier
npm run type-check    # vue-tsc --build
npm run build         # type-check + vite build (เหมือน pre-push)
```

---

## ดู Log / Output

| วิธี | เห็น output |
|------|-------------|
| `git commit` / `git push` ใน **Terminal** | ครบที่สุด |
| Cursor/VS Code → **Show Command Output** | output ของ hook |
| Cursor/VS Code → **Open Git Log** | log Git (อาจไม่ครบ) |
| `sh .husky/pre-commit` / `sh .husky/pre-push` | ทดสอบดู output โดยตรง |

> Hook **ไม่ได้บันทึก log ลงไฟล์** — output แสดงที่ terminal / Git UI เท่านั้น

---

## ข้าม Hook (Skip)

ใช้เฉพาะกรณีจำเป็น (เช่น hotfix ฉุกเฉิน)

```sh
# ข้าม pre-commit + commit-msg
git commit --no-verify -m "chore: emergency fix"

# ข้าม pre-push
git push --no-verify
```

ปิด Husky ทั้ง session (ไม่แนะนำ):

```sh
HUSKY=0 git commit -m "chore: skip all husky hooks"
HUSKY=0 git push
```

---

## ทดสอบ Error Scenario

ลองให้ hook fail ชั่วคราว:

```sh
# 1. ใส่ type error ใน src/ (เช่น const n: number = 'abc')
# 2. รัน hook
sh .husky/pre-push    # หรือ sh .husky/pre-commit
# 3. revert โค้ดกลับ
```

ทดสอบ commit message ไม่ผ่าน:

```sh
sh .husky/commit-msg /tmp/bad-msg.txt
# โดยใส่ข้อความเช่น "bad message" ในไฟล์นั้น
```

---

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (ปิด Vetur ถ้ามี)
