const express = require('express');
const router = express.Router();
const {
  createSettlement,
  getSettlementsByGroup,
  getSettlementById,
  updateSettlement,
  deleteSettlement,
} = require('../controllers/settlementController');

router.post('/', createSettlement);
router.get('/group/:groupId', getSettlementsByGroup);
router.get('/:id', getSettlementById);
router.put('/:id', updateSettlement);
router.delete('/:id', deleteSettlement);

module.exports = router;
