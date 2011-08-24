#include "PlayDialog.h"
#include "ui_PlayDialog.h"

PlayDialog::PlayDialog(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::PlayDialog)
{
    ui->setupUi(this);
}

PlayDialog::~PlayDialog()
{
    delete ui;
}
