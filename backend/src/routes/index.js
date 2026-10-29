const { Router } = require('express');
const authRoutes = require('./auth.routes');
const dashboardRoutes = require('./dashboard.routes');
const ticketRoutes = require('./ticket.routes');
const departmentRoutes = require('./department.routes');
const categoryRoutes = require('./category.routes');
const causeRoutes = require('./cause.routes');
const userRoutes = require('./user.routes');
const notificationRoutes = require('./notification.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/tickets', ticketRoutes);
router.use('/departments', departmentRoutes);
router.use('/categories', categoryRoutes);
router.use('/causes', causeRoutes);
router.use('/users', userRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
