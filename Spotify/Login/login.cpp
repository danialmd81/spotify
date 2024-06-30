#include "login.h"
#include "ui_login.h"

Login::Login(QWidget *parent)
    : QDialog(parent), ui(new Ui::Login)
{
    ui->setupUi(this);
}

Login::~Login()
{
    delete ui;
}

void Login::on_ShowPassword_stateChanged(int arg1)
{
    if (arg1 == 2)
        ui->password->setEchoMode(QLineEdit::Normal);
    else
        ui->password->setEchoMode(QLineEdit::Password);
}

void Login::on_ForgotPasswprd_clicked()
{
    forg = new ForgetPassword(this);
    forg->exec();
}

void Login::on_Register_clicked()
{
    reg = new Register(this);
    reg->exec();
}

void Login::on_LoginButt_clicked() {}
