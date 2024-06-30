#ifndef LOGIN_H
#define LOGIN_H

#include "Login/forgetpassword.h"
#include "Login/register.h"
#include <QDialog>

namespace Ui
{
    class Login;
}

class Login : public QDialog
{
    Q_OBJECT

public:
    explicit Login(QWidget *parent = nullptr);
    ~Login();

private slots:
    void on_ShowPassword_stateChanged(int arg1);

    void on_ForgotPasswprd_clicked();

    void on_Register_clicked();

    void on_LoginButt_clicked();

private:
    Ui::Login *ui;
    Register *reg;
    ForgetPassword *forg;
};

#endif // LOGIN_H
