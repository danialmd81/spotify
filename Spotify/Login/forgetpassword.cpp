#include "forgetpassword.h"
#include "ui_forgetpassword.h"

ForgetPassword::ForgetPassword(QWidget *parent) : QDialog(parent), ui(new Ui::ForgetPassword)
{
    ui->setupUi(this);
    ui->VerLabel->hide();
    ui->VerLine->hide();
}

ForgetPassword::~ForgetPassword()
{
    delete ui;
}
