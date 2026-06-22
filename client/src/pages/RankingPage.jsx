

import { useState, useEffect, useMemo } from 'react';
import { Card, Table, Spinner, Alert, Row, Col, Badge } from 'react-bootstrap';
import API from '../API.js';
import { useAuth } from '../useAuth.js';

const MEDALS = ['🥇', '🥈', '🥉'];

function RankingPage() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    API.getRanking()
      .then((data) => {
        if (!cancelled) setRanking(data);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load the ranking. Please try again.');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    if (!ranking) return { top: 0, players: 0 };
    const top = ranking.reduce((m, r) => Math.max(m, r.bestScore), 0);
    return { top, players: ranking.length };
  }, [ranking]);

  if (error) return <Alert variant="danger">{error}</Alert>;

  if (!ranking) {
    return (
      <div className="d-flex justify-content-center mt-5">
        <Spinner animation="border" role="status" />
      </div>
    );
  }

  return (
    <div className="mx-auto" style={{ maxWidth: '720px' }}>
      <h2 className="text-center mb-1">🏆 General ranking</h2>
      <p className="text-center text-muted">
        Compete with other players and climb to the top of the leaderboard.
      </p>

      <Row className="g-3 mb-3">
        <Col xs={6} md={4}>
          <div className="stat-card">
            <div className="label">🔥 Highest score</div>
            <div className="value">{stats.top} coins</div>
          </div>
        </Col>
        <Col xs={6} md={4}>
          <div className="stat-card">
            <div className="label">👥 Ranked players</div>
            <div className="value">{stats.players}</div>
          </div>
        </Col>
        <Col xs={12} md={4}>
          <div className="stat-card">
            <div className="label">🎮 You</div>
            <div className="value">{user ? user.username : '—'}</div>
          </div>
        </Col>
      </Row>

      <Card className="lr-card">
        <Card.Body>
          {ranking.length === 0 ? (
            <Card.Text className="text-muted text-center mb-0">
              No games have been completed yet. Be the first!
            </Card.Text>
          ) : (
            <Table hover responsive className="mb-0 align-middle">
              <thead>
                <tr>
                  <th style={{ width: '70px' }}>Rank</th>
                  <th>Player</th>
                  <th className="text-end">Best score</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((row, index) => {
                  const isMe = user && row.username === user.username;
                  return (
                    <tr key={row.username} className={isMe ? 'table-success' : undefined}>
                      <td>{MEDALS[index] || index + 1}</td>
                      <td>
                        {row.username}
                        {isMe && <Badge bg="success" className="ms-2">you</Badge>}
                      </td>
                      <td className="text-end">
                        <strong>{row.bestScore}</strong>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}

export default RankingPage;