
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ethers } from 'ethers';
import './App.css';
import { AdminPage } from './pages/AdminPage';
import { ROICalculator } from './pages/ROICalculator.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import  TxHistory  from './pages/TxHistory.jsx';
const STAKING_CONTRACT_ADDRESS = "0x27DF3213E9bC6C8F7AAf96018db66BFdDfB3Fc2D";

// --- ABIs ---
const STAKING_ABI = [
	{
		"inputs": [
			{
				"internalType": "contract IERC20",
				"name": "_token",
				"type": "address"
			}
		],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "owner",
				"type": "address"
			}
		],
		"name": "OwnableInvalidOwner",
		"type": "error"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "OwnableUnauthorizedAccount",
		"type": "error"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "stakeAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "stakingAmount",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "stakingPeriod",
				"type": "uint256"
			}
		],
		"name": "stakeToken",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "withdrawalAddress",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "withdrawAmount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_userAddress",
				"type": "address"
			}
		],
		"name": "availableAmountForClaim",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "depositCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "depositInfo",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "depositId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "userAddress",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "depositAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "monthlyPercentage",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "depositedTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "maturityTimestamp",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "timePeriodInDays",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "releasePercentageFromDays",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_days",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "releasePercentagePerMonth",
				"type": "uint256"
			}
		],
		"name": "setReleasePercentageV4",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_t",
				"type": "address"
			}
		],
		"name": "settokenAddress",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "tokenAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_days",
				"type": "uint256"
			}
		],
		"name": "stakeTokens",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "token",
		"outputs": [
			{
				"internalType": "contract IERC20",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalTokensStaked",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userDepositCounts",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "userDepositIds",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userStakedStatus",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "userTotalTokenStaked",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "withdrawTokensV4",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "withdrawnAmount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
const ERC20_ABI = [
  "function approve(address,uint256) returns (bool)",
  "function allowance(address,address) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function owner() view returns (address)",
  "function mint(address to, uint256 amount)"
];

const DURATION_OPTIONS = [
  { days: 30, risk: "Low risk" },
  { days: 90, risk: "Medium risk" },
  { days: 365, risk: "High risk" }
];

const AMOY = {
  chainIdHex: "0x13882",
  chainId: 80002,
  rpcUrls: ["https://polygon-amoy-bor-rpc.publicnode.com"],
  chainName: "Polygon Amoy",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  blockExplorerUrls: ["https://www.oklink.com/amoy"],
};

function Dashboard() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);

  const [stakingContract, setStakingContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [tokenDecimals, setTokenDecimals] = useState(18);

  const [isLoading, setIsLoading] = useState(false);

  const [userTokenBalance, setUserTokenBalance] = useState('0');
  const [userTotalStaked, setUserTotalStaked] = useState('0');
  const [claimableAmount, setClaimableAmount] = useState('0');
  const [userDeposits, setUserDeposits] = useState([]);
  const [stakingPlans, setStakingPlans] = useState([]);

  const [stakeAmount, setStakeAmount] = useState('');
  const [stakeDays, setStakeDays] = useState(90);
  const [estimatedReward, setEstimatedReward] = useState('0.00');
  const [maturityDate, setMaturityDate] = useState('');

  const [isFlowing, setIsFlowing] = useState(false); // unified button state
  const [isClaiming, setIsClaiming] = useState(false);

  const formatBalance = (value, decimals = tokenDecimals) => {
    if (!value) return '0';
    try {
      const f = ethers.utils.formatUnits(value, decimals);
      return Number(f).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } catch {
      return '0';
    }
  };

  const ensureAmoy = async (eth) => {
    const current = await eth.request({ method: 'eth_chainId' });
    if (current?.toLowerCase() !== AMOY.chainIdHex) {
      try {
        await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY.chainIdHex }] });
      } catch (switchErr) {
        if (switchErr?.code === 4902) {
          await eth.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: AMOY.chainIdHex,
              chainName: AMOY.chainName,
              nativeCurrency: AMOY.nativeCurrency,
              rpcUrls: AMOY.rpcUrls,
              blockExplorerUrls: AMOY.blockExplorerUrls
            }]
          });
        } else { throw switchErr; }
      }
    }
  };

  const connectWallet = async () => {
    try {
      if (!window.ethereum) return alert("MetaMask not found.");
      await ensureAmoy(window.ethereum);
      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      await web3Provider.send("eth_requestAccounts", []);
      const web3Signer = web3Provider.getSigner();
      const addr = await web3Signer.getAddress();
      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(addr);
    } catch (e) {
      console.error(e);
      alert('Failed to connect wallet.');
    }
  };

  // setup contracts
  useEffect(() => {
    if (account && signer) {
      const contract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, signer);
      setStakingContract(contract);
      (async () => {
        try {
          const tokenAddr = await contract.token();
          const token = new ethers.Contract(tokenAddr, ERC20_ABI, signer);
          setTokenContract(token);
          const dec = await token.decimals();
          setTokenDecimals(dec);
        } catch (e) { console.error('setup token failed', e); }
      })();
    } else {
      setStakingContract(null);
      setTokenContract(null);
    }
  }, [account, signer]);

  // fetch balances
  const fetchData = useCallback(async () => {
    if (!stakingContract || !tokenContract || !account) return;
    setIsLoading(true);
    try {
      const dec = await tokenContract.decimals().catch(() => tokenDecimals);
      const [balance, userStaked, claimable] = await Promise.all([
        tokenContract.balanceOf(account),
        stakingContract.userTotalTokenStaked(account),
        stakingContract.availableAmountForClaim(account),
      ]);
      const count = (await stakingContract.userDepositCounts(account)).toNumber?.() ?? 0;
      const deposits = [];
      for (let i = 0; i < count; i++) {
        const depositId = await stakingContract.userDepositIds(account, i);
        const deposit = await stakingContract.depositInfo(depositId);
        deposits.push(deposit);
      }
      setUserTokenBalance(formatBalance(balance, dec));
      setUserTotalStaked(formatBalance(userStaked, dec));
      setClaimableAmount(formatBalance(claimable, dec));
      setUserDeposits(deposits);
    } catch (e) { console.error(e); } finally { setIsLoading(false); }
  }, [stakingContract, tokenContract, account, tokenDecimals]);

  useEffect(() => { if (stakingContract && tokenContract && account) fetchData(); }, [stakingContract, tokenContract, account, fetchData]);

  // read-only plans
  useEffect(() => {
    (async () => {
      try {
        const ro = new ethers.providers.JsonRpcProvider(AMOY.rpcUrls[0]);
        const readOnly = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, ro);
        const plans = await Promise.all(DURATION_OPTIONS.map(async ({ days, risk }) => {
          const raw = await readOnly.releasePercentageFromDays(days);
          const monthlyPercentage = raw.toNumber() / 10; // 2.5 => 2.5%
          const apy = monthlyPercentage * 12;
          return { days, risk, percentage: monthlyPercentage, apy };
        }));
        setStakingPlans(plans);
      } catch (e) { console.error('plans', e); }
    })();
  }, []);

  // reward estimate
  useEffect(() => {
    const plan = stakingPlans.find(p => p.days === stakeDays);
    if (Number(stakeAmount) > 0 && plan) {
      const monthlyRate = plan.percentage / 100;
      setEstimatedReward((parseFloat(stakeAmount) * monthlyRate).toFixed(4));
    } else setEstimatedReward('0.00');
    const d = new Date(); d.setDate(d.getDate() + Number(stakeDays || 0));
    setMaturityDate(d.toLocaleDateString());
  }, [stakeAmount, stakeDays, stakingPlans]);

  // unified Approve -> Stake flow
  const handleStakeFlow = async () => {
    if (!account) return alert('Connect wallet');
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) return alert('Enter amount');
    try {
      setIsFlowing(true);
      const amt = ethers.utils.parseUnits(stakeAmount, tokenDecimals);
      const allowance = await tokenContract.allowance(account, STAKING_CONTRACT_ADDRESS);
      if (allowance.lt(amt)) {
        const tx1 = await tokenContract.approve(STAKING_CONTRACT_ADDRESS, amt);
        await tx1.wait();
      }
      const tx2 = await stakingContract.stakeTokens(amt, Number(stakeDays));
      await tx2.wait();
      alert('Staked successfully!');
      setStakeAmount('');
      fetchData();
    } catch (e) {
      console.error(e);
      alert('Stake failed.');
    } finally { setIsFlowing(false); }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try { const tx = await stakingContract.withdrawTokensV4(); await tx.wait(); alert('Rewards claimed!'); fetchData(); }
    catch (e) { console.error(e); alert('Claim failed.'); }
    finally { setIsClaiming(false); }
  };

  // listeners
  useEffect(() => {
    if (!window.ethereum) return; const eth = window.ethereum;
    const onAccounts = (accs) => { if (accs?.length) setAccount(ethers.utils.getAddress(accs[0])); else { setAccount(null); setSigner(null); setProvider(null);} };
    const onChain = async () => { try { await ensureAmoy(eth);} catch{} if (provider){ setSigner(provider.getSigner()); } fetchData(); };
    eth.on('accountsChanged', onAccounts); eth.on('chainChanged', onChain);
    return () => { eth.removeListener('accountsChanged', onAccounts); eth.removeListener('chainChanged', onChain); };
  }, [provider, fetchData]);

  useEffect(() => {
    if (!stakingContract || !account) return; const refresh = () => fetchData();
    stakingContract.on('stakeToken', refresh); stakingContract.on('withdraw', refresh);
    return () => { stakingContract.off('stakeToken', refresh); stakingContract.off('withdraw', refresh); };
  }, [stakingContract, account, fetchData]);

  return (
    <div className="App">
      <header className="header">
        <div className="header-left"><div className="logo">Litcoin Staking</div></div>
        <nav
  className="top-nav"
  style={{
    display: "flex",
    alignItems: "center",
    gap: "1.2rem",
    background: "rgba(255,255,255,0.05)",
    padding: "0.6rem 1.2rem",
    borderRadius: "12px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 0 8px rgba(0,0,0,0.15)",
  }}
>
  {[
    { label: "Dashboard", path: "/" },
    { label: "Transactions", path: "/txs" },
    { label: "ROI Calculator", path: "/roi" },
    { label: "Help", path: "/help" },
    { label: "Admin", path: "/admin" },
  ].map((item) => (
    <Link
      key={item.path}
      to={item.path}
      style={{
        color: "white",
        fontWeight: 500,
        textDecoration: "none",
        fontSize: "0.95rem",
        transition: "0.25s ease",
        padding: "6px 10px",
        borderRadius: "8px",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.background =
          "linear-gradient(90deg,#6b5bff,#00d2ff)")
      }
      onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {item.label}
    </Link>
  ))}
</nav>

        <button onClick={connectWallet} className="btn btn-primary" disabled={!!account}>
          {account ? `${account.substring(0,4)}...${account.substring(account.length-4)}` : 'Connect Wallet'}
        </button>
      </header>

      <div className="dashboard-metrics">
        <div className="metric-card"><div className="metric-card-header"><span>Total Staked</span><div className="metric-icon" style={{background:'var(--gradient-blue)'}}></div></div><div className="metric-card-value">{userTotalStaked}</div><div className="metric-card-footer">LTC Tokens</div></div>
        <div className="metric-card"><div className="metric-card-header"><span>Available Rewards</span><div className="metric-icon" style={{background:'var(--gradient-green)'}}></div></div><div className="metric-card-value">{claimableAmount}</div><div className="metric-card-footer">LTC Tokens</div></div>
        <div className="metric-card"><div className="metric-card-header"><span>Active Stakes</span><div className="metric-icon" style={{background:'var(--gradient-blue)'}}></div></div><div className="metric-card-value">{userDeposits.length}</div><div className="metric-card-footer">Positions</div></div>
      </div>

      <main className="main-layout">
        <div className="main-content">
          <div className="card stake-card">
            <h2>Stake Tokens</h2>
            <div className="form-group">
              <label className="form-label"><span>Staking Amount</span><span>Available: {userTokenBalance}</span></label>
              <div className="input-wrapper">
                <input type="number" className="input-field" placeholder="0.00" value={stakeAmount} onChange={(e)=>setStakeAmount(e.target.value)} />
                <button className="max-btn" onClick={()=>setStakeAmount(userTokenBalance.replace(/,/g,''))}>MAX</button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Staking Period</label>
              <div className="staking-period-options">
                {stakingPlans.map(plan => (
                  <div key={plan.days} className={`period-option ${stakeDays===plan.days?'active':''}`} onClick={()=>setStakeDays(plan.days)}>
                    <h4>{plan.days} Days</h4>
                    <span>{plan.apy}% APY</span>
                    <p>{plan.risk}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="estimation-row"><span>Estimated Monthly Rewards:</span><span>~{estimatedReward} LTC</span></div>
            <div className="estimation-row"><span>Maturity Date:</span><span>{maturityDate}</span></div>
            <button onClick={handleStakeFlow} className="btn btn-primary" disabled={!account || isFlowing} style={{marginTop:'1.5rem'}}>
              {isFlowing ? 'Processing…' : 'Stake Tokens'}
            </button>
            {!account && <p className="connect-prompt">Connect your wallet to start staking</p>}
          </div>

          <div className="card portfolio-card">
            <h2>Your Staking Portfolio</h2>
            {account ? (isLoading ? (<div className="loader"></div>) : userDeposits.length>0 ? (
              <table className="portfolio-table"><thead><tr><th>ID</th><th>Amount</th><th>Monthly Rate</th><th>Maturity Date</th><th>Status</th></tr></thead><tbody>
                {userDeposits.map((d)=>{ const mat = d.maturityTimestamp.toNumber()*1000 < Date.now();
                  return (<tr key={d.depositId.toString()}><td>#{d.depositId.toString()}</td><td>{formatBalance(d.depositAmount)} LTC</td><td>{d.monthlyPercentage.toNumber()/10}%</td><td>{new Date(d.maturityTimestamp.toNumber()*1000).toLocaleDateString()}</td><td><span className={`status-tag ${mat?'status-matured':'status-active'}`}>{mat?'Matured':'Active'}</span></td></tr>);
                })}
              </tbody></table>
            ) : <p className="connect-prompt">You have no active stakes.</p>) : <p className="connect-prompt">Connect your wallet to view your staking portfolio</p>}
          </div>
        </div>

        <aside className="sidebar">
          <div className="card rewards-card"><h2>Available Rewards</h2><div className="rewards-circle"><span className="rewards-amount">{claimableAmount}</span></div><button onClick={handleClaim} className="btn btn-claim" disabled={!account || isClaiming || parseFloat(claimableAmount.replace(/,/g,''))===0}>{isClaiming?'Claiming…':'Claim Rewards'}</button>{!account && <p className="connect-prompt">Connect your wallet to view rewards</p>}</div>
          <div className="card quick-actions-card"><h2>Quick Actions</h2><Link to="/txs" className="quick-action-item">Transaction History</Link><Link to="/roi" className="quick-action-item">ROI Calculator</Link><Link to="/help" className="quick-action-item">Help Center</Link></div>
        </aside>
      </main>
    </div>
  );
}

// Shell app with routes
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/txs" element={<TxHistory />} />
        <Route path="/roi" element={<ROICalculator />} />
        <Route path="/help" element={<HelpCenter />} />
      </Routes>
    </Router>
  );
}