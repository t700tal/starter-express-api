import jwt from "jsonwebtoken"

export const createJWT = (content) => {
  return jwt.sign(content, process.env.JWT_SECRET)
}
