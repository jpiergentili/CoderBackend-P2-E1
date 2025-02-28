import { fileURLToPath } from 'url';
import { dirname } from 'path';
import bcrypt from "bcrypt";

const __fileName = fileURLToPath(import.meta.url);
const __dirname = dirname(__fileName);

export default __dirname;

export const createHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(10))

export const isValidPassword = (user, password) => bcrypt.compareSync(password, user.password);