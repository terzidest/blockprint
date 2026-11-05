// publishConfig.exports rewriting (src -> dist) is a pnpm feature; npm
// ignores it and would publish a manifest pointing at files not in the
// tarball. Refuse to publish from anything that isn't pnpm.
const agent = process.env.npm_config_user_agent ?? "";
if (!agent.startsWith("pnpm")) {
  console.error(
    "blockprint must be published with pnpm (`pnpm publish`): npm ignores " +
      "publishConfig.exports and would ship src/ paths that are not packed.",
  );
  process.exit(1);
}
