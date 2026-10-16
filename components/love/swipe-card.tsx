import * as React from "react";
import { Icon } from "@/components/ui/icon";
import { ageFromBirthdate, type DatingProfile } from "@/lib/dating";

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function SwipeCard({
  profile,
  className,
}: {
  profile: DatingProfile;
  className?: string;
}) {
  const photo = profile.photos[0]?.url;

  return (
    <div
      className={`flex flex-col bg-card border border-divider rounded-2xl shadow-lg overflow-hidden ${className ?? ""}`}
    >
      <div className="h-64 grid place-items-center bg-accent-100 text-accent-700 overflow-hidden">
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt={profile.displayName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-5xl font-bold">{initials(profile.displayName)}</span>
        )}
      </div>
      <div className="flex flex-col gap-2 p-5">
        <div className="flex items-baseline gap-2">
          <span className="text-xl font-semibold">{profile.displayName}</span>
          <span className="text-neutral-600 text-lg">{ageFromBirthdate(profile.birthdate)}</span>
        </div>
        <span className="flex items-center gap-1.5 text-sm text-neutral-600">
          <Icon name="pin" size={14} />
          {profile.city}
        </span>
        <p className="text-sm text-neutral-700 m-0 line-clamp-3">{profile.bio}</p>
        {profile.interests.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {profile.interests.slice(0, 6).map((interest) => (
              <span
                key={interest}
                className="text-xs px-2 py-0.5 rounded-full bg-accent-100 text-accent-700 font-medium"
              >
                {interest}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
