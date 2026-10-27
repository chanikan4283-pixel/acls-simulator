import json,os,subprocess,sys,numpy as np
sys.path.insert(0,'/home/claude/video/audio');import sfx
from scipy.io import wavfile
FR='/home/claude/video/frames';FPS=30;SR=sfx.SR
# (folder, extra cues [(t,name)])
SEGS=[('mg_intro',[(0.23,'beep'),(.88,'beep'),(1.53,'beep'),(2.18,'beep'),(2.6,'riser2'),(2.95,'boom'),(6.0,'whoosh')]),
      ('mg_anywhere',[(0.0,'whoosh'),(.5,'boom_s'),(3.25,'tap')]),
      ('mg_ch1',[(0,'whoosh'),(.15,'boom_s')]),
      ('case1',[]),
      ('mg_ch2',[(0,'whoosh'),(.15,'boom_s')]),
      ('c2',[]),('c3',[]),('c4',[]),('c5',[]),('c6',[]),
      ('mg_live',[(0,'whoosh'),(.2,'boom_s'),(2.2,'tap'),(2.4,'alarm'),(4.6,'tap'),(4.9,'alarm'),(6.8,'tap'),(7.1,'rosc')]),
      ('mg_patients',[(0,'whoosh'),(.2,'boom_s'),(.9,'riser_s'),(1.6,'good'),(2.0,'good'),(2.3,'good'),(2.7,'good')]),
      ('mg_outro',[(0,'whoosh'),(.3,'boom'),(1.2,'beep'),(1.8,'beep')])]
def frames(d):return sorted(f for f in os.listdir(f'{FR}/{d}') if f.endswith('.jpg'))
def lib(name):
    L=sfx.LIB
    if name=='beep':return sfx.beep(1000,.09,.22)
    if name=='riser2':return sfx.riser(.6)*.8
    if name=='boom_s':return sfx.boom(1.4)*.45
    if name=='riser_s':return sfx.riser(1.0)*.5
    return L[name]() if name in L else None
os.makedirs('/home/claude/video/seg',exist_ok=True)
tl=0;cues=[];parts=[]
for d,extra in SEGS:
    fs=frames(d)
    if not fs: print('skip',d);continue
    n=int(fs[-1][:5])+1 if d.startswith('mg_') else len(fs)
    # mg frames may be strided only in tests; assume full
    dur=len(fs)/FPS
    js=f'{FR}/{d}.json'
    c=json.load(open(js))['cues'] if os.path.exists(js) else []
    for t,name in c+extra: cues.append((tl+t,name))
    out=f'/home/claude/video/seg/{d}.mp4'
    fade=f"fade=t=in:st=0:d=0.25,fade=t=out:st={dur-.25:.3f}:d=0.25" if not d.startswith('mg_') else "null"
    subprocess.run(['ffmpeg','-y','-loglevel','error','-framerate',str(FPS),'-pattern_type','glob','-i',f'{FR}/{d}/*.jpg','-vf',f"scale=1920:1080:flags=lanczos,{fade},format=yuv420p",'-c:v','libx264','-preset','medium','-crf','18','-r',str(FPS),out],check=True)
    parts.append(out);print(d,round(tl,2),round(dur,2));tl+=dur
open('/home/claude/video/seg/list.txt','w').write(''.join(f"file '{p}'\n" for p in parts))
subprocess.run(['ffmpeg','-y','-loglevel','error','-f','concat','-safe','0','-i','/home/claude/video/seg/list.txt','-c','copy','/home/claude/video/seg/video.mp4'],check=True)
# audio
total=tl+.5;mix=np.zeros(int(total*SR))
gain={'tap':.55,'whoosh':.8,'cpr':.7,'shock':1.0,'charge':.8,'alarm':.6,'rosc':.9,'push':.8,'good':.6,'monitor':.6,'lab':.6,'pads':.7,'bvm':.7,'iv':.4,'airway':.7,'start':.5,'clear':.6}
for t,name in cues:
    s=lib(name)
    if s is None: print('nocue',name);continue
    st=int(t*SR);s=s*gain.get(name,1.0);e=min(len(mix),st+len(s));mix[st:e]+=s[:e-st]
mus=sfx.music(total)*1.0
fade=np.ones(len(mus));fi=int(2*SR);fade[:fi]=np.linspace(0,1,fi);fade[-int(3*SR):]=np.linspace(1,0,int(3*SR))
mix=mix+mus*fade*1.5
mix=mix/np.max(np.abs(mix))*.89
st=np.stack([mix,mix],1)
wavfile.write('/home/claude/video/seg/audio.wav',SR,(st*32767).astype(np.int16))
subprocess.run(['ffmpeg','-y','-loglevel','error','-i','/home/claude/video/seg/video.mp4','-i','/home/claude/video/seg/audio.wav','-c:v','copy','-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart','/home/claude/video/ACLS-sim-presentation.mp4'],check=True)
print('TOTAL',round(tl,1),'cues',len(cues))
