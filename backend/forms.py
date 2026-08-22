from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, BooleanField, SelectField, FloatField, TextAreaField, IntegerField, SubmitField
from wtforms.validators import DataRequired, Email, Length, Optional

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Пароль', validators=[DataRequired()])
    remember_me = BooleanField('Запомнить меня')
    submit = SubmitField('Войти')

class RegisterForm(FlaskForm):
    full_name = StringField('ФИО', validators=[DataRequired(), Length(min=2, max=150)])
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Пароль', validators=[DataRequired(), Length(min=6)])
    profession = SelectField('Сфера деятельности', choices=[
        ('designer', 'Дизайнер'),
        ('developer', 'Разработчик'),
        ('copywriter', 'Копирайтер'),
        ('marketer', 'Маркетолог'),
        ('other', 'Другое')
    ])
    is_self_employed = BooleanField('Статус самозанятого (НПД)', default=True)
    inn = StringField('ИНН', validators=[Optional(), Length(max=12)])
    phone = StringField('Телефон', validators=[Optional()])
    submit = SubmitField('Зарегистрироваться')

class ClientForm(FlaskForm):
    name = StringField('Название / ФИО клиента', validators=[DataRequired()])
    type = SelectField('Тип клиента', choices=[('legal', 'Юрлицо/ИП (6%)'), ('individual', 'Физлицо (4%)')])
    inn = StringField('ИНН', validators=[Optional()])
    email = StringField('Email', validators=[DataRequired(), Email()])
    phone = StringField('Телефон', validators=[Optional()])
    tags = StringField('Теги (через запятую)', validators=[Optional()])
    notes = TextAreaField('Заметки', validators=[Optional()])
    submit = SubmitField('Сохранить клиента')

class InvoiceForm(FlaskForm):
    number = StringField('Номер счета', validators=[DataRequired()])
    date = StringField('Дата выставления', validators=[DataRequired()])
    due_date = StringField('Срок оплаты', validators=[DataRequired()])
    notes = TextAreaField('Примечания к счету', validators=[Optional()])
    submit = SubmitField('Выставить счет')
