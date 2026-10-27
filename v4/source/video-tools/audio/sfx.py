import numpy as np
from scipy.signal import butter,sosfilt
SR=48000
def t(d):return np.arange(int(SR*d))/SR
def env(n,a=.005,r=None):
    e=np.ones(n);na=max(1,int(a*SR));e[:na]=np.linspace(0,1,na)
    if r: nr=min(n,int(r*SR));e[-nr:]*=np.linspace(1,0,nr)
    return e
def lp(x,f,o=2):return sosfilt(butter(o,f,'low',fs=SR,output='sos'),x)
def hp(x,f,o=2):return sosfilt(butter(o,f,'high',fs=SR,output='sos'),x)
def bp(x,lo,hi,o=2):return sosfilt(butter(o,[lo,hi],'band',fs=SR,output='sos'),x)
def noise(d):return np.random.default_rng(1).standard_normal(int(SR*d))
def tap():
    x=t(.06);s=np.sin(2*np.pi*2300*x)*np.exp(-x*90)*.5+hp(noise(.06),3000)*np.exp(-x*160)*.25;return s*.6
def whoosh(d=.8):
    n=noise(d);x=t(d);out=np.zeros_like(n)
    # sweep bandpass via chunks
    k=48;L=len(n)//k
    for i in range(k):
        f=300+ (i/k)**1.5*5000
        seg=bp(n[i*L:(i+1)*L+256],f*.7,min(f*1.4,20000))[:L]
        out[i*L:i*L+len(seg)]=seg
    e=np.sin(np.pi*x/d)**2;return out*e*.55
def boom(d=2.2):
    x=t(d);f=58*np.exp(-x*.6)+38;ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*np.exp(-x*1.8)*.9+lp(noise(d),400)*np.exp(-x*12)*.5+hp(noise(d),2500)*np.exp(-x*30)*.12
    return s*env(len(x),.002)*.9
def riser(d=2.5):
    x=t(d);f=200+1800*(x/d)**2;ph=2*np.pi*np.cumsum(f)/SR
    s=(np.sin(ph)+.4*np.sin(2*ph))*(x/d)**2*.25+bp(noise(d),800,9000)*(x/d)**3*.25
    return s
def charge(d=3.2):
    x=t(d);f=500+2600*(1-np.exp(-x*1.1));ph=2*np.pi*np.cumsum(f)/SR
    s=np.sin(ph)*.18*np.minimum(1,x*3)
    # ready beeps at end
    for k in range(3):
        st=int((d-.5+k*.15)*SR)
        if st<len(s):b=np.sin(2*np.pi*1800*t(.08))*.3;s[st:st+len(b)]+=b[:len(s)-st]
    return s
def shock():
    x=t(1.0);s=np.sin(2*np.pi*48*x)*np.exp(-x*5)*1.0+lp(noise(1.0),900)*np.exp(-x*14)*.9+hp(noise(1.0),3000)*np.exp(-x*40)*.3
    return s*env(len(x),.001)*.85
def beep(f=980,d=.09,v=.25):x=t(d);return np.sin(2*np.pi*f*x)*env(len(x),.003,.03)*v
def alarm():
    out=np.zeros(int(SR*1.1))
    for k,f in enumerate([880,880,880,698,698]):
        b=beep(f,.12,.22);st=int(k*.16*SR);out[st:st+len(b)]+=b
    return out
def chime():
    out=np.zeros(int(SR*2.2))
    for k,f in enumerate([523.25,659.25,783.99,1046.5]):
        x=t(1.8);b=(np.sin(2*np.pi*f*x)+.3*np.sin(4*np.pi*f*x))*np.exp(-x*2.2)*.18*env(len(x),.004);st=int(k*.09*SR);out[st:st+len(b)]+=b
    return out
def good():
    out=np.zeros(int(SR*.6))
    for k,f in enumerate([1318.5,1760]):
        x=t(.45);b=np.sin(2*np.pi*f*x)*np.exp(-x*7)*.18;st=int(k*.08*SR);out[st:st+len(b)]+=b
    return out
def push():x=t(.7);return bp(noise(.7),1500,6000)*np.sin(np.pi*x/.7)*.18
def pads():x=t(.35);return lp(noise(.35),1800)*np.exp(-x*12)*.4+tap()[:1]*0
def thump():x=t(.3);return np.sin(2*np.pi*70*x)*np.exp(-x*22)*.6
def cpr():
    out=np.zeros(int(SR*2.5))
    for k in range(5):
        b=thump()*.5;st=int(k*.55*SR);out[st:st+len(b)]+=b
    return out
def bvm():x=t(.9);return bp(noise(.9),300,1800)*np.sin(np.pi*x/.9)**2*.25
def lab():return np.concatenate([beep(1200,.08,.2),np.zeros(int(.05*SR)),beep(1600,.12,.2)])
LIB={'tap':tap,'whoosh':whoosh,'boom':boom,'riser':riser,'charge':charge,'shock':shock,'alarm':alarm,'rosc':chime,'good':good,'push':push,'pads':pads,'cpr':cpr,'bvm':bvm,'lab':lab,'monitor':lambda:beep(1000,.1,.22),'clear':lambda:np.concatenate([beep(700,.15,.2),np.zeros(2400),beep(700,.15,.2)]),'start':riser,'iv':tap,'airway':bvm}
def music(d,bpm=96):
    """Ambient futuristic pad + heartbeat pulse."""
    x=t(d);out=np.zeros(len(x))
    chords=[[110,164.81,220,261.63,329.63],[87.31,130.81,174.61,220,261.63],[130.81,196,261.63,329.63,392],[98,146.83,196,246.94,293.66]]
    bar=60/bpm*4*2  # 2 bars per chord
    rng=np.random.default_rng(3)
    for i in range(int(d/bar)+1):
        st=int(i*bar*SR);n=min(len(x)-st,int(bar*SR*1.25))
        if n<=0:break
        xx=t(n/SR)
        for f in chords[i%4]:
            for det in (-.003,.003):
                ph=2*np.pi*f*(1+det)*xx+rng.random()*6
                saw=2*((ph/(2*np.pi))%1)-1
                out[st:st+n]+=saw*.018*np.minimum(1,xx/1.5)*np.minimum(1,(n/SR-xx)/1.0)
    out=lp(out,1400)
    # sub pulse (heartbeat lub-dub) every beat pair
    beat=60/bpm
    for k in range(int(d/beat)):
        if k%2: continue
        for off,a in ((0,.35),(.16,.22)):
            st=int((k*beat+off)*SR);b=np.sin(2*np.pi*52*t(.25))*np.exp(-t(.25)*16)*a
            if st+len(b)<len(out):out[st:st+len(b)]+=b
    # shimmer arps
    notes=[880,1046.5,1318.5,1760]
    for k in range(int(d/(beat/2))):
        if rng.random()<.35:
            f=notes[rng.integers(4)];st=int(k*beat/2*SR);b=np.sin(2*np.pi*f*t(.6))*np.exp(-t(.6)*6)*.03
            if st+len(b)<len(out):out[st:st+len(b)]+=b
    return out
