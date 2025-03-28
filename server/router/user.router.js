import {Router} from 'express'
import jwtVerify from '../middleware/userAuth.middleware.js'
import { userInfo, userLogin, userRegister,reportInfo, commentInfo} from '../controller/user.controller.js'


const userRouter = Router()

userRouter.route('/me').get(jwtVerify,userInfo)
userRouter.route('/reports').get(jwtVerify,reportInfo)
userRouter.route('/comments').get(jwtVerify,commentInfo)
userRouter.route('/register').post(userRegister)
userRouter.route('/login').post(userLogin)

export default userRouter