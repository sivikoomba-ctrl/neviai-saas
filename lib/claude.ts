import Anthropic from "@anthropic-ai/sdk";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

export default new Proxy({} as Anthropic, {
  get(_, prop) {
    return (getClient() as any)[prop];
  },
});
