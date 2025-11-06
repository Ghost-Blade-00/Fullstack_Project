// backend/src/lib/utils.js
import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

  //  Cookie configured for localhost dev + XHR (Axios) with credentials
  res.cookie("jwt", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,        // use true only behind HTTPS
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return token;
};
