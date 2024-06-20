#include "spotify.h"

#include <QApplication>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    Spotify w;
    w.show();
    return a.exec();
}
