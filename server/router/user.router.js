import {Router} from 'express'
import jwtVerify from '../middleware/userAuth.middleware.js'
import { userInfo, userLogin, userRegister } from '../controller/user.controller.js'


const userRouter = Router()

userRouter.route('/me').get(jwtVerify,userInfo)
userRouter.route('/register').post(userRegister)
userRouter.route('/login').post(userLogin)

export default userRouter