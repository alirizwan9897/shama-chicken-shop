const express = require('express');
const pool = require('../maindb');
const { hashPassword, verifyPassword, publicUser, validateUserInput } = require('../users');
const router = express.Router();
router.post('/signup', async (req, res) => {
  try {
    const validation = validateUserInput(req.body);
    if (validation.error) return res.status(400).json({ error: validation.error });
    const { name, phone, email, password, role = 'user' } = validation.value;
    const result = await pool.query(
      'INSERT INTO users (name, phone, email, password, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, phone, email, role, created_at',
      [name.trim(), phone.trim(), email.trim().toLowerCase(), hashPassword(password), role]
    );
    return res.status(201).json(publicUser(result.rows[0]));
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }
    const result = await pool.query(
      'SELECT id, name, phone, email, password, role, created_at FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({
        error: 'Invalid email'
      });
    }
    const user = result.rows[0];
    if (!verifyPassword(password, user.password)) {
      return res.status(401).json({
        error: 'Invalid password'
      });
    }
    return res.status(200).json({
      message: 'Login successful',
      user: publicUser(user)
    });
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});
router.get('/get', async (req, res) => {
  console.log('[users/get] Request received; checking database connection');
  try {
    const result = await pool.query(
      'SELECT id, name, phone, email, role, created_at FROM users ORDER BY id'
    );
    console.log(`[users/get] Database query succeeded; returned ${result.rowCount} users`);
    return res.status(200).json(result.rows);
  } catch (error) {
    console.error('[users/get] Database query failed:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      hint: error.hint,
    });
    return handleDatabaseError(error, res);
  }
});
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });
  try {
    const result = await pool.query(
      'SELECT id, name, phone, email, role, created_at FROM users WHERE id = $1',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(result.rows[0]);
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});
router.put('/:id', updateUser);
router.patch('/:id', updateUser);
async function updateUser(req, res) {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });
  try {
    const validation = validateUserInput(req.body, { partial: true });
    if (validation.error) return res.status(400).json({ error: validation.error });
    const fields = validation.value;
    const updates = [];
    const values = [];
    for (const field of ['name', 'phone', 'email', 'role']) {
      if (fields[field] !== undefined) {
        values.push(field === 'email' ? fields[field].trim().toLowerCase() : fields[field].trim());
        updates.push(`${field} = $${values.length}`);
      }
    }
    if (fields.password !== undefined) {
      values.push(hashPassword(fields.password));
      updates.push(`password = $${values.length}`);
    }
    if (updates.length === 0) return res.status(400).json({ error: 'At least one field is required' });
    values.push(id);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING id, name, phone, email, role, created_at`,
      values
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(publicUser(result.rows[0]));
  } catch (error) {
    return handleDatabaseError(error, res);
  }
}
router.delete('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ error: 'id must be a positive integer' });
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    return res.status(204).end();
  } catch (error) {
    return handleDatabaseError(error, res);
  }
});
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function handleDatabaseError(error, res) {
  if (error.code === '23505') return res.status(409).json({ error: 'Email is already in use' });
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}
module.exports = router;
