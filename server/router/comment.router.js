import {Router} from 'express'
import jwtVerify from '../middleware/userAuth.middleware.js'
import { allComment,addComment,deleteComment } from '../controller/comment.controller.js'
 
const commentRouter = Router()

commentRouter.route('/:reportId').get(allComment)
commentRouter.route('/').post(jwtVerify,addComment)
commentRouter.route('/:commentId').delete(jwtVerify,deleteComment)

export default commentRouter