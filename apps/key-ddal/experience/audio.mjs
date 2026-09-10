// Finite, explicit-gesture sample; cancellation fences asynchronous decoding.
export class PairedSample {
  constructor(gain, onState, Audio = globalThis.AudioContext) { this.gain=gain; this.onState=onState; this.Audio=Audio; this.epoch=0; this.voices=[]; }
  stop() { this.epoch++; clearTimeout(this.timer); for(const s of this.voices) { try{s.stop();}catch{} } this.voices=[]; this.output?.disconnect(); this.output=null; this.onState(false); }
  async play(pair) {
    this.stop(); const epoch=this.epoch;
    this.context ??= new this.Audio();
    await this.context.resume();
    if(epoch!==this.epoch) return;
    this.onState(true);
    try {
      const buffers=await Promise.all(pair.map(async p => {
        if(!/^assets\/[a-zA-Z0-9_./-]+\.wav$/.test(p.path) || p.path.includes('..')) throw Error('Invalid asset');
        const r=await fetch(p.path,{credentials:'omit',referrerPolicy:'no-referrer'}); if(!r.ok) throw Error('Audio unavailable');
        return this.context.decodeAudioData(await r.arrayBuffer());
      }));
      if(epoch!==this.epoch) return;
      const gain=this.context.createGain(); this.output=gain; gain.gain.value=this.gain; gain.connect(this.context.destination);
      const downGap=Math.max(.12,buffers[0].duration+.04), strokeGap=downGap+buffers[1].duration+.24;
      const start=this.context.currentTime+.03;
      for(let stroke=0;stroke<2;stroke++) for(let edge=0;edge<2;edge++) {
        const voice=this.context.createBufferSource();voice.buffer=buffers[edge];voice.connect(gain);this.voices.push(voice);voice.start(start+stroke*strokeGap+(edge?downGap:0));
      }
      this.timer=setTimeout(()=>{if(epoch===this.epoch){this.stop();gain.disconnect();}},(2*strokeGap+.1)*1000);
    } catch(error) { if(epoch===this.epoch){this.stop();throw error;} }
  }
}
