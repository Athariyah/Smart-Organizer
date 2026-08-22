import os
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User, Client, Invoice, InvoiceItem, Task, Event, TaxReport
from forms import LoginForm, RegisterForm, ClientForm, InvoiceForm

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'smart-organizer-secret-key-2026')
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///organizer.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/')
def landing():
    return jsonify({
        "status": "ok",
        "message": "Умный Органайзер для Самозанятых API",
        "version": "1.0 MVP"
    })

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and user.check_password(form.password.data):
            login_user(user, remember=form.remember_me.data)
            return redirect(url_for('dashboard'))
        flash('Неверный email или пароль', 'danger')
    return jsonify({"route": "/login", "status": "rendered"})

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        if User.query.filter_by(email=form.email.data).first():
            flash('Пользователь с таким email уже существует', 'warning')
        else:
            user = User(
                email=form.email.data,
                full_name=form.full_name.data,
                profession=form.profession.data,
                is_self_employed=form.is_self_employed.data,
                inn=form.inn.data,
                phone=form.phone.data
            )
            user.set_password(form.password.data)
            db.session.add(user)
            db.session.commit()
            login_user(user)
            return redirect(url_for('dashboard'))
    return jsonify({"route": "/register", "status": "rendered"})

@app.route('/dashboard')
@login_required
def dashboard():
    invoices = Invoice.query.filter_by(user_id=current_user.id).all()
    total_invoices = len(invoices)
    paid_invoices = [i for i in invoices if i.status == 'paid']
    paid_sum = sum(i.total for i in paid_invoices)
    npd_tax = sum(i.tax_amount for i in paid_invoices)

    return jsonify({
        "user": current_user.full_name,
        "total_invoices": total_invoices,
        "paid_sum": paid_sum,
        "npd_tax_to_pay": npd_tax
    })

@app.route('/invoices', methods=['GET'])
@login_required
def get_invoices():
    invoices = Invoice.query.filter_by(user_id=current_user.id).all()
    return jsonify([
        {
            "id": i.id,
            "number": i.number,
            "date": i.date,
            "total": i.total,
            "status": i.status
        } for i in invoices
    ])

@app.route('/taxes', methods=['GET'])
@login_required
def get_tax_report():
    invoices = Invoice.query.filter_by(user_id=current_user.id, status='paid').all()
    ind_sum = sum(i.total for i in invoices if i.client.type == 'individual')
    leg_sum = sum(i.total for i in invoices if i.client.type == 'legal')
    tax_4 = ind_sum * 0.04
    tax_6 = leg_sum * 0.06

    return jsonify({
        "individual_income": ind_sum,
        "legal_income": leg_sum,
        "tax_4_percent": tax_4,
        "tax_6_percent": tax_6,
        "total_tax_to_pay": tax_4 + tax_6
    })

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)
