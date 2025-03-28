import {Router} from 'express'
import jwtVerify from '../middleware/userAuth.middleware.js'
import { allReport,addReport,deleteReport,updateReport } from '../controller/report.controller.js'

const reportRouter = Router()

reportRouter.route('/').get(allReport)
reportRouter.route('/').post(jwtVerify,addReport)
reportRouter.route('/:reportId').put(jwtVerify,updateReport)
reportRouter.route('/:reportId').delete(jwtVerify,deleteReport)

export default reportRouter