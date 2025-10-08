import { useEffect, useState } from 'react';

const PLANS = [
  { days:30, monthly:2.0 },
  { days:90, monthly:2.5 },
  { days:365, monthly:3.0 },
];

export function ROICalculator(){
  const [amount,setAmount]=useState('');
  const [plan,setPlan]=useState(90);
  const [est,setEst]=useState('0.00');

  useEffect(()=>{
    const p = PLANS.find(x=>x.days===Number(plan));
    if (!p || !amount) { setEst('0.00'); return; }
    const m = (Number(p.monthly)/100) * Number(amount);
    setEst(m.toFixed(4));
  },[amount,plan]);

  return (
    <div className="page">
      <h1>ROI Calculator</h1>
      <div className="form-inline">
        <input className="input-field" type="number" placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
        <select className="input-field" value={plan} onChange={e=>setPlan(e.target.value)}>
          {PLANS.map(p=> <option key={p.days} value={p.days}>{p.days} days — {p.monthly}%/mo</option>)}
        </select>
      </div>
      <p style={{marginTop:12}}>Estimated monthly rewards: <b>{est}</b></p>
      <small>Note: This is a simple monthly estimate, not APY-compounded.</small>
    </div>
  );
}
