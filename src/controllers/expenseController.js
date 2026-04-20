const Expense = require('../models/Expense');

exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ user: req.user.id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).send('Server error');
  }
};

exports.addExpense = async (req, res) => {
  const { description, amount, category } = req.body;
  try {
    const newExpense = new Expense({
      user: req.user.id,
      description,
      amount,
      category
    });
    const expense = await newExpense.save();
    res.json(expense);
  } catch (err) {
    console.error('ADD ERROR', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

exports.updateExpense = async (req, res) => {
  const { description, amount, category } = req.body;
  try {
    let expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ msg: 'Expense not found' });
    if (expense.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    expense = await Expense.findByIdAndUpdate(req.params.id, { description, amount, category }, { new: true });
    res.json(expense);
  } catch (err) {
    console.error('UPDATE ERROR', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  console.log('DELETE REQUEST', { id: req.params.id, user: req.user?.id });
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      console.log('DELETE NOT FOUND', req.params.id);
      return res.status(404).json({ msg: 'Expense not found' });
    }
    if (expense.user.toString() !== req.user.id) {
      console.log('DELETE NOT AUTH', { expenseUser: expense.user.toString(), requestUser: req.user.id });
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Expense.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Expense removed' });
  } catch (err) {
    console.error('DELETE ERROR', err);
    res.status(500).json({ msg: err.message || 'Server error' });
  }
};