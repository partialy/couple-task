import React from "react";
import { Users } from "@/api/sql_models";

export default function PartnerProfileHero({ profile }: { profile: Users }) {
  const name = profile.nickname?.trim() || profile.username || "TA";
  const title = profile.title?.trim();
  const level = profile.level;

  return (
    <div className="relative overflow-hidden rounded-b-[28px] bg-white px-4 pb-8 pt-2 shadow-sm dark:bg-slate-800">
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/15 blur-2xl dark:bg-cyan-500/10" />
      <div className="pointer-events-none absolute -bottom-10 left-0 h-32 w-32 rounded-full bg-pink-400/15 blur-2xl dark:bg-pink-500/10" />
      <div className="relative flex flex-col items-center pt-4">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-linear-to-tr from-cyan-400 to-blue-500 opacity-60 blur-md" />
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt=""
              className="relative h-24 w-24 rounded-full border-4 border-white object-cover shadow-lg dark:border-slate-700"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-slate-200 text-2xl font-bold text-slate-500 dark:border-slate-700 dark:bg-slate-600 dark:text-slate-300">
              {name.slice(0, 1)}
            </div>
          )}
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-100">{name}</h2>
        {(title || level != null) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {level != null && (
              <span className="rounded-full bg-cyan-500/15 px-3 py-0.5 text-xs font-semibold text-cyan-600 dark:bg-cyan-400/15 dark:text-cyan-300">
                Lv.{level}
              </span>
            )}
            {title && (
              <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700/80 dark:text-slate-300">
                {title}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
