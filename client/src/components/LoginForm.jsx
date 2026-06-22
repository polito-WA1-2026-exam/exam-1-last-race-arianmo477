

import { useState } from 'react';
import { Form, Button, Alert, Card, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth.js';


const TEST_USERS = [
  { username: 'mario', password: 'password123' },
  { username: 'lucia', password: 'metro2026' },
  { username: 'paolo', password: 'lastrace!' },
];

function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!username.trim() || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login({ username: username.trim(), password });
      navigate('/play');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  // Prefill the fields for a test account (does not auto-submit).
  function fillTestUser(u) {
    setUsername(u.username);
    setPassword(u.password);
    setError('');
  }

  return (
    <Card className="mx-auto" style={{ maxWidth: '420px' }}>
      <Card.Body>
        <Card.Title className="mb-3">Log in to play</Card.Title>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="loginUsername">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="loginPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button type="submit" variant="primary" disabled={submitting} className="w-100">
            {submitting ? 'Logging in…' : 'Login'}
          </Button>
        </Form>

        <hr />

        <div className="text-muted small mb-2">Quick fill (test accounts):</div>
        <Stack direction="horizontal" gap={2} className="flex-wrap">
          {TEST_USERS.map((u) => (
            <Button
              key={u.username}
              variant="outline-secondary"
              size="sm"
              onClick={() => fillTestUser(u)}
              disabled={submitting}
            >
              {u.username}
            </Button>
          ))}
        </Stack>
      </Card.Body>
    </Card>
  );
}

export default LoginForm;