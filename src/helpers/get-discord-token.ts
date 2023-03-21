export const getDiscordToken = (NODE_ENV: string | undefined): string => {
  if (!NODE_ENV) throw new Error("NODE_ENV is undefined");
  let token: string | undefined = "";

  switch (NODE_ENV) {
    case "development":
      token = process.env.DISCORD_DEV_TOKEN;
      break;
    case "production":
      token = process.env.DISCORD_PROD_TOKEN;
      break;
    default:
      throw new Error("Unrecognised launch mode");
  }

  if (!token) throw new Error("Token is undefined");
  return token;
};
