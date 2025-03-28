import dotenv from 'dotenv'
dotenv.config();

export const config =  {
    port : process.env.PORT,
    jwt_secret : process.env.JWT_SECRET

}