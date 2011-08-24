#ifndef PLAYDIALOG_H
#define PLAYDIALOG_H

#include <QDialog>

namespace Ui {
    class PlayDialog;
}

class PlayDialog : public QDialog
{
    Q_OBJECT

public:
    explicit PlayDialog(QWidget *parent = 0);
    ~PlayDialog();

private:
    Ui::PlayDialog *ui;
};

#endif // PLAYDIALOG_H
