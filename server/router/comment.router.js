import {Router} from 'express'
import jwtVerify from '../middleware/userAuth.middleware.js'
import { allComment,addComment } from '../controller/comment.controller.js'

const commentRouter = Router()

commentRouter.route('/').get(allComment)
commentRouter.route('/').post(jwtVerify,addComment)
// commentRouter.route('/:commentId').put(jwtVerify,updateComment)
// commentRouter.route('/:commentId').delete(jwtVerify,deleteComment)

export default commentRouter