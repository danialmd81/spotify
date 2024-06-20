#include "spotify.h"
#include "ui_spotify.h"

Spotify::Spotify(QWidget *parent)
    : QMainWindow(parent)
    , ui(new Ui::Spotify)
{
    ui->setupUi(this);
}

Spotify::~Spotify()
{
    delete ui;
}
