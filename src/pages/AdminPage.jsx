import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const STAKING_ADDR = "0x27DF3213E9bC6C8F7AAf96018db66BFdDfB3Fc2D";
const STAKING_ABI_ADMIN = [
  "function token() view returns (address)",
  "function setReleasePercentageV4(uint256 days_, uint256 tenthPercent) external",
  "function releasePercentageFromDays(uint256) view returns (uint256)",
];
const ERC20_ADMIN = [
  "function decimals() view returns (uint8)",
  "function owner() view returns (address)",
  "function mint(address to, uint256 amount)",
];

export function AdminPage(){
  const [account,setAccount]=useState(null);
  const [signer,setSigner]=useState(null);
  const [token,setToken]=useState(null);
  const [staking,setStaking]=useState(null);
  const [decimals,setDecimals]=useState(18);
  const [isOwner,setIsOwner]=useState(false);
  const [mintTo,setMintTo]=useState('');
  const [mintAmt,setMintAmt]=useState('');
  const [planDays,setPlanDays]=useState(90);
  const [planPct,setPlanPct]=useState(''); // in % like 2.5 -> we send 25

  const ensureAmoy = async (eth) => {
    const AMOY = { chainIdHex: "0x13882" };
    const current = await eth.request({ method: 'eth_chainId' });
    if (current?.toLowerCase() !== AMOY.chainIdHex) {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY.chainIdHex }] });
    }
  };

  const connect = async ()=>{
    if (!window.ethereum) return alert('MetaMask not found');
    await ensureAmoy(window.ethereum);
    const p = new ethers.providers.Web3Provider(window.ethereum);
    await p.send('eth_requestAccounts',[]);
    const s = p.getSigner();
    const a = await s.getAddress();
    setSigner(s); setAccount(a);
    const st = new ethers.Contract(STAKING_ADDR, STAKING_ABI_ADMIN, s);
    setStaking(st);
    const tokenAddr = await st.token();
    const tk = new ethers.Contract(tokenAddr, ERC20_ADMIN, s);
    setToken(tk);
    const dec = await tk.decimals(); setDecimals(dec);
    try{ const own = await tk.owner(); setIsOwner(own?.toLowerCase()===a.toLowerCase()); }catch{ setIsOwner(false); }
  };

  const handleMint = async ()=>{
    if (!isOwner) return alert('Only token owner');
    if (!mintTo || !mintAmt) return alert('Enter recipient & amount');
    try{
      const amt = ethers.utils.parseUnits(mintAmt, decimals);
      const tx = await token.mint(mintTo, amt); await tx.wait(); alert('Minted');
      setMintAmt('');
    }catch(e){ console.error(e); alert('Mint failed'); }
  };

  const handleSetPlan = async ()=>{
    if (!isOwner) return alert('Only owner');
    try{
      const tenth = Math.round(Number(planPct)*10); // 2.5 -> 25
      const tx = await staking.setReleasePercentageV4(Number(planDays), tenth);
      await tx.wait();
      alert('Updated plan');
    }catch(e){ console.error(e); alert('Update failed'); }
  };

  return (
    <div className="page">
      <h1>Admin</h1>
      {!account ? (<button className="btn btn-primary" onClick={connect}>Connect Admin Wallet</button>) : (
        isOwner ? (
          <>
            <section className="card">
              <h2>Mint Tokens</h2>
              <div className="form-group"><label>Recipient</label><input className="input-field" value={mintTo} onChange={e=>setMintTo(e.target.value)} placeholder="0x..."/></div>
              <div className="form-group"><label>Amount</label><input className="input-field" type="number" value={mintAmt} onChange={e=>setMintAmt(e.target.value)} placeholder="1000"/></div>
              <button className="btn btn-mint" onClick={handleMint}>Mint</button>
            </section>
            <section className="card">
              <h2>Update Staking Plan</h2>
              <div className="form-inline">
                <input type="number" className="input-field" value={planDays} onChange={e=>setPlanDays(e.target.value)} placeholder="Days (e.g., 90)"/>
                <input type="number" className="input-field" value={planPct} onChange={e=>setPlanPct(e.target.value)} placeholder="Monthly % (e.g., 2.5)"/>
                <button className="btn btn-primary" onClick={handleSetPlan}>Save</button>
              </div>
              <p style={{marginTop:8}}>Hint: 2.5% will be stored as 25 (tenths of a percent).</p>
            </section>
          </>
        ) : (<p>Connected account is <b>not</b> the token owner.</p>)
      )}
    </div>
  );
}
