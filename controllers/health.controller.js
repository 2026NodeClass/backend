const getHealth = (req, res) => {
  res.status(200).json({ message: 'success', data: { status: 'ok' } });
};

module.exports = { getHealth };
