import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/empire/Shell";
import { Btn, Field, PageHead, Panel, TextArea } from "@/components/empire/ui";
import { cn } from "@/lib/cn";
import { DISCUSSIONS, IDEAS, SEED_COMMENTS } from "@/lib/empire/catalog";
import { useEmpire } from "@/lib/empire/store";

export const Route = createFileRoute("/council")({
  head: () => ({ meta: [{ title: "Council · Satoshi Retro Empire" }] }),
  component: CouncilPage,
});

const STATUS: Record<string, string> = {
  discussion: "In der Runde",
  accepted: "Angenommen",
  backlog: "Später",
};

function CouncilPage() {
  const [tab, setTab] = useState<"rounds" | "ideas">("rounds");
  return (
    <Shell>
      <PageHead
        kicker="Retro Council"
        title="Nicht nur spielen. Mitbauen."
        text="Stimmen und Ideen bleiben auf diesem Gerät und werden zum öffentlichen Ausgangsstand dazugezählt. Das ist der Prototyp einer offenen Halle, kein Server voller Profile."
      />
      <div className="mb-4 grid grid-cols-2 gap-2">
        <Btn variant={tab === "rounds" ? "solid" : "ghost"} onClick={() => setTab("rounds")}>
          Runden
        </Btn>
        <Btn variant={tab === "ideas" ? "solid" : "ghost"} onClick={() => setTab("ideas")}>
          Ideen
        </Btn>
      </div>
      {tab === "rounds" ? <Rounds /> : <Ideas />}
    </Shell>
  );
}

function Rounds() {
  const votes = useEmpire((s) => s.discussionVotes);
  const comments = useEmpire((s) => s.comments);
  const handle = useEmpire((s) => s.handle);
  const voteDiscussion = useEmpire((s) => s.voteDiscussion);
  const addComment = useEmpire((s) => s.addComment);

  return (
    <div className="grid gap-4">
      {DISCUSSIONS.map((thread) => (
        <Panel key={thread.id}>
          <p className="font-mono text-xs text-primary">
            {thread.category} · {thread.author}
          </p>
          <h2 className="mt-1 text-xl font-extrabold">{thread.title}</h2>
          <p className="mt-2 text-sm text-muted">{thread.body}</p>
          <div className="mt-4 grid gap-2">
            {thread.options.map((option) => {
              const selected = votes[thread.id] === option.id;
              const count = option.votes + (selected ? 1 : 0);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => voteDiscussion(thread.id, option.id)}
                  className={cn(
                    "flex min-h-11 items-center justify-between gap-3 rounded-md border px-3 text-left text-sm font-semibold",
                    selected ? "border-primary bg-surface-2 text-primary" : "border-border bg-bg",
                  )}
                >
                  <span>{option.label}</span>
                  <span className="font-mono text-xs tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
          <ul className="mt-4 grid gap-3">
            {(SEED_COMMENTS[thread.id] ?? []).map((comment) => (
              <li key={comment.body} className="text-sm">
                <span className="font-semibold">{comment.author}</span>{" "}
                <span className="text-muted">{comment.body}</span>
              </li>
            ))}
            {comments
              .filter((comment) => comment.threadId === thread.id)
              .map((comment) => (
                <li key={comment.id} className="text-sm">
                  <span className="font-semibold">{handle}</span> <span className="text-muted">{comment.body}</span>
                </li>
              ))}
          </ul>
          <CommentBox
            onSubmit={(body) => addComment(thread.id, body)}
          />
        </Panel>
      ))}
    </div>
  );
}

function CommentBox({ onSubmit }: { onSubmit: (body: string) => { ok: boolean; error?: string } }) {
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  return (
    <form
      className="mt-4 grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        const result = onSubmit(body);
        if (!result.ok) {
          setError(result.error ?? "Nicht gespeichert.");
          return;
        }
        setBody("");
        setError("");
      }}
    >
      <TextArea
        value={body}
        maxLength={280}
        placeholder="Ein Satz zur Runde"
        onChange={(event) => setBody(event.target.value)}
      />
      <div className="flex items-center gap-3">
        <Btn type="submit">Kommentar</Btn>
        {error ? <p className="text-sm text-primary">{error}</p> : null}
      </div>
    </form>
  );
}

function Ideas() {
  const ideaVotes = useEmpire((s) => s.ideaVotes);
  const mine = useEmpire((s) => s.ideas);
  const handle = useEmpire((s) => s.handle);
  const voteIdea = useEmpire((s) => s.voteIdea);
  const addIdea = useEmpire((s) => s.addIdea);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState("");

  return (
    <div className="grid gap-4">
      <Panel>
        <h2 className="text-lg font-extrabold">Idee legen</h2>
        <form
          className="mt-3 grid gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const result = addIdea(title, body);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            setTitle("");
            setBody("");
            setError("");
          }}
        >
          <Field value={title} maxLength={80} placeholder="Titel" onChange={(event) => setTitle(event.target.value)} />
          <TextArea
            value={body}
            maxLength={280}
            placeholder="Was soll die Halle daraus machen?"
            onChange={(event) => setBody(event.target.value)}
          />
          <div className="flex items-center gap-3">
            <Btn type="submit">Vorschlagen</Btn>
            {error ? <p className="text-sm text-primary">{error}</p> : null}
          </div>
        </form>
      </Panel>
      {mine.map((idea) => (
        <IdeaRow
          key={idea.id}
          title={idea.title}
          body={idea.body}
          author={handle}
          status="Dein Vorschlag"
          votes={1 + (ideaVotes[idea.id] === -1 ? -2 : 0)}
          dir={ideaVotes[idea.id] ?? 1}
          onVote={(dir) => voteIdea(idea.id, dir)}
        />
      ))}
      {IDEAS.map((idea) => {
        const dir = ideaVotes[idea.id] ?? 0;
        return (
          <IdeaRow
            key={idea.id}
            title={idea.title}
            body={idea.body}
            author={idea.author}
            status={`${STATUS[idea.status]} · ${idea.roadmap}`}
            votes={idea.baseVotes + dir}
            dir={dir}
            onVote={(next) => voteIdea(idea.id, next)}
          />
        );
      })}
    </div>
  );
}

function IdeaRow({
  title,
  body,
  author,
  status,
  votes,
  dir,
  onVote,
}: {
  title: string;
  body: string;
  author: string;
  status: string;
  votes: number;
  dir: number;
  onVote: (dir: 1 | -1) => void;
}) {
  return (
    <Panel>
      <p className="font-mono text-xs text-primary">
        {status} · {author}
      </p>
      <h2 className="mt-1 text-xl font-extrabold">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Btn variant={dir === 1 ? "solid" : "ghost"} onClick={() => onVote(1)} aria-pressed={dir === 1}>
          Dafür {votes}
        </Btn>
        <Btn variant={dir === -1 ? "solid" : "ghost"} onClick={() => onVote(-1)} aria-pressed={dir === -1}>
          Dagegen
        </Btn>
      </div>
    </Panel>
  );
}
