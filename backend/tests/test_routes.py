import pytest
from app import app, db
from models import User

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['WTF_CSRF_ENABLED'] = False

    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client
            db.drop_all()

def test_landing_route(client):
    rv = client.get('/')
    assert rv.status_code == 200
    assert b'1.0 MVP' in rv.data

def test_login_route(client):
    rv = client.get('/login')
    assert rv.status_code == 200

def test_register_flow(client):
    rv = client.post('/register', data={
        'full_name': 'Тестовый Исполнитель',
        'email': 'test@organizer.ru',
        'password': 'password123',
        'profession': 'developer',
        'is_self_employed': True,
        'inn': '772812345678'
    }, follow_redirects=True)

    assert rv.status_code == 200
    user = User.query.filter_by(email='test@organizer.ru').first()
    assert user is not None
    assert user.full_name == 'Тестовый Исполнитель'
