import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";

export type Introduction = {
  userId: string;
  name: string;
  body: string;
  updatedOn: string;
};

function readIntro(input: unknown): { name: string; body: string } | { error: string } {
  if (!input || typeof input !== "object") return { error: "Angaben fehlen." };
  const raw = input as { name?: unknown; body?: unknown };
  const name = typeof raw.name === "string" ? raw.name.trim().replace(/\s+/g, " ").slice(0, 24) : "";
  const body = typeof raw.body === "string" ? raw.body.trim().slice(0, 320) : "";
  if (name.length < 2) return { error: "Der Name braucht mindestens 2 Zeichen." };
  if (body.length < 12) return { error: "Die Vorstellung braucht mindestens 12 Zeichen." };
  return { name, body };
}

export const listIntroductions = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await getSql();
    const rows = await sql<{ user_id: string; name: string; body: string; updated_on: string }>`
      select user_id, name, body, to_char(updated_at at time zone 'utc', 'YYYY-MM-DD') as updated_on
      from introductions
      order by updated_at desc
    `;
    return rows.map((row) => ({
      userId: row.user_id,
      name: row.name,
      body: row.body,
      updatedOn: row.updated_on,
    }));
  });

export const saveIntroduction = createServerFn({ method: "POST" })
  .validator((input: unknown) => readIntro(input))
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    if ("error" in data) return data;
    const sql = await getSql();
    await sql`
      insert into introductions (user_id, name, body)
      values (${context.userId}, ${data.name}, ${data.body})
      on conflict (user_id) do update
      set name = excluded.name, body = excluded.body, updated_at = now()
    `;
    return { ok: true as const };
  });
