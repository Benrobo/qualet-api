import { randomUUID } from "crypto";
import bcryptjs from "bcryptjs";

export const genId = () => randomUUID();

export const genOrgId = (count = 6) => {
  const alph = "abcdefgh0123456789".split("");
  let randId = "";

  for (let i = 0; i < count; i++) {
    const rand = Math.floor(Math.random() * alph.length);
    randId += alph[rand];
  }
  return randId;
};

export const genHash = (salt = 10, string) => {
  return bcryptjs.hashSync(salt, string);
};

export const compareHash = (string, hash) => {
  return bcryptjs.compareSync(string, hash);
};
