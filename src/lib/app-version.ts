/** Label for UI: `v. 0.1.0 (build 3-1728345678)` (+ ` - DEV` in local). */
export function getAppVersionLabel(): string {
  const version = import.meta.env.VITE_APP_VERSION;
  const build = import.meta.env.VITE_APP_BUILD_NUMBER || "local";
  const label = `v. ${version} (build ${build})`;
  return import.meta.env.DEV ? `${label} - DEV` : label;
}
