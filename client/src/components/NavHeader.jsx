import { Navbar, Container, Nav, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../useAuth.js';

function NavHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate('/'); // back to the instructions after logging out
  }

  return (
    <Navbar bg="dark" variant="dark" expand="sm" className="px-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/">
          🚝 Last Race
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            {/* Instructions are public and always reachable. */}
            <Nav.Link as={NavLink} to="/" end>
              Instructions
            </Nav.Link>

            {user && (
              <>
                <Nav.Link as={NavLink} to="/play">
                  Play
                </Nav.Link>
                <Nav.Link as={NavLink} to="/ranking">
                  Ranking
                </Nav.Link>
              </>
            )}
          </Nav>

          <Nav className="align-items-center">
            {user ? (
              <>
                <Navbar.Text className="me-3">
                  Signed in as <strong>{user.username}</strong>
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Button as={Link} to="/login" variant="outline-light" size="sm">
                Login
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default NavHeader;