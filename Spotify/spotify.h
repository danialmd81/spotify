#ifndef SPOTIFY_H
#define SPOTIFY_H

#include <QMainWindow>

QT_BEGIN_NAMESPACE
namespace Ui {
class Spotify;
}
QT_END_NAMESPACE

class Spotify : public QMainWindow
{
    Q_OBJECT

public:
    Spotify(QWidget *parent = nullptr);
    ~Spotify();

private:
    Ui::Spotify *ui;
};
#endif // SPOTIFY_H
