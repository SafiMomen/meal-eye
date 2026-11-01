import { LoadingMessage } from "./loading-message";

export function DiningWorkspaceFallback() {
  return (
    <div
      className={[
        "min-h-screen w-full bg-background",
        "px-4 py-5 sm:px-6 lg:px-8 lg:py-7",
      ].join(" ")}
    >
      <LoadingMessage className="mx-auto max-w-[90rem]">
        Loading menus...
      </LoadingMessage>
    </div>
  );
}
