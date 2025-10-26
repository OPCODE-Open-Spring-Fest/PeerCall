import jwt from "jsonwebtoken";

export const generateToken = (userId: string) => {
  const expiresIn = "7d"; 
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
    expiresIn,
  });
  return token;
};
