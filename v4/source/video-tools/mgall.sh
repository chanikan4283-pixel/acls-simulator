cd /home/claude/video/mg
F=/home/claude/video/frames/case1
python3 mgrec.py intro 10.2 "{\"IMG1\":\"file://$F/00470.jpg\"}"
python3 mgrec.py anywhere 7.0 "{\"IMG1\":\"file://$F/02700.jpg\",\"IMG2\":\"file://$F/01560.jpg\",\"IMG3\":\"file://$F/00330.jpg\"}"
python3 mgrec.py chapter 2.4 '{"KICK":"Gameplay","TITLE":"One real case."}' ch1
python3 mgrec.py chapter 2.4 '{"KICK":"Five cases · ECG coach","TITLE":"Every algorithm."}' ch2
python3 mgrec.py live 9.2
python3 mgrec.py patients 8.5
python3 mgrec.py outro 6.5
echo MGDONE
